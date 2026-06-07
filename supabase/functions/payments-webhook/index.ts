import { createClient } from "npm:@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { type StripeEnv, verifyWebhook, createStripeClient } from "../_shared/stripe.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Legacy one-time credit packs (kept so prior purchases still resolve)
const CREDIT_MAP: Record<string, number> = {
  credits_250_onetime: 250,
  credits_500_onetime: 500,
  credits_600_onetime: 600,
  credits_1500_onetime: 1500,
  credits_1800_onetime: 1800,
  credits_4000_onetime: 4000,
  credits_9000_onetime: 9000,
};

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const url = new URL(req.url);
  const rawEnv = url.searchParams.get("env");
  if (rawEnv !== "sandbox" && rawEnv !== "live") {
    return new Response(JSON.stringify({ received: true, ignored: "invalid env" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  const env: StripeEnv = rawEnv;

  try {
    const event = await verifyWebhook(req, env);
    console.log("Received event:", event.type, "env:", env);

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await upsertSubscription(event.data.object, env);
        break;
      case "customer.subscription.deleted":
        await markCanceled(event.data.object, env);
        break;
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object, env);
        break;
      default:
        console.log("Unhandled event:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response("Webhook error", { status: 400 });
  }
});

async function upsertSubscription(subscription: any, env: StripeEnv) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error("No userId in subscription metadata");
    return;
  }
  const item = subscription.items?.data?.[0];
  const priceId = item?.price?.lookup_key
    || item?.price?.metadata?.lovable_external_id
    || item?.price?.id;
  const productId = item?.price?.product;
  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;

  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      product_id: typeof productId === "string" ? productId : productId?.id || "",
      price_id: priceId,
      status: subscription.status,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" }
  );
}

async function markCanceled(subscription: any, env: StripeEnv) {
  await supabase
    .from("subscriptions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", subscription.id)
    .eq("environment", env);
}

// Maps a2a credit price lookup_keys to amounts in cents
const A2A_CREDIT_MAP: Record<string, number> = {
  a2a_credit_25_once: 2500,
  a2a_credit_100_once: 10000,
  a2a_credit_500_once: 50000,
};

async function handleCheckoutCompleted(session: any, env: StripeEnv) {
  // Subscriptions are handled by customer.subscription.* events.
  if (session.mode !== "payment") return;

  const stripe = createStripeClient(env);
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { expand: ['data.price'] });

  // A2A partner credit purchase
  const partnerId = session.metadata?.a2a_partner_id;
  if (partnerId) {
    let creditCents = 0;
    for (const item of lineItems.data) {
      const lookupKey = (item.price as any)?.lookup_key;
      if (lookupKey && A2A_CREDIT_MAP[lookupKey]) {
        creditCents += A2A_CREDIT_MAP[lookupKey] * (item.quantity || 1);
      }
    }
    if (creditCents === 0) return;

    const { data: partner } = await supabase
      .from("a2a_partners").select("balance_cents").eq("id", partnerId).maybeSingle();
    if (!partner) return;
    await supabase.from("a2a_partners").update({
      balance_cents: (partner.balance_cents || 0) + creditCents,
      updated_at: new Date().toISOString(),
    }).eq("id", partnerId);
    console.log("A2A partner credited", partnerId, creditCents);
    return;
  }

  // Legacy app credit purchase
  const userId = session.metadata?.userId;
  if (!userId) return;

  let creditsToAdd = 0;
  for (const item of lineItems.data) {
    const lookupKey = (item.price as any)?.lookup_key;
    if (lookupKey && CREDIT_MAP[lookupKey]) {
      creditsToAdd += CREDIT_MAP[lookupKey] * (item.quantity || 1);
    }
  }
  if (creditsToAdd === 0) return;

  await supabase.from("credit_purchases").upsert(
    {
      user_id: userId,
      stripe_session_id: session.id,
      credits_added: creditsToAdd,
      amount_cents: session.amount_total || 0,
      environment: env,
    },
    { onConflict: "stripe_session_id" }
  );

  const { data: existing } = await supabase
    .from("user_credits")
    .select("balance, total_purchased")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    await supabase.from("user_credits").update({
      balance: existing.balance + creditsToAdd,
      total_purchased: existing.total_purchased + creditsToAdd,
      updated_at: new Date().toISOString(),
    }).eq("user_id", userId);
  } else {
    await supabase.from("user_credits").insert({
      user_id: userId,
      balance: 50 + creditsToAdd,
      total_purchased: creditsToAdd,
    });
  }
}
