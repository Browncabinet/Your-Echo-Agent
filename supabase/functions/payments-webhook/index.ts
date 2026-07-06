import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, verifyWebhook, createStripeClient } from "../_shared/stripe.ts";

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
  }
  return _supabase;
}

// One-time email top-up packs: price_id -> emails granted
const TOPUP_MAP: Record<string, number> = {
  topup_500: 500,
  topup_1000: 1000,
  topup_2500: 2500,
};

// A2A partner credit map: price_id -> cents added to partner balance
const A2A_CREDIT_MAP: Record<string, number> = {
  topup_500: 1200,
  topup_1000: 2200,
  topup_2500: 4500,
  a2a_credit_test_1_once: 100,
  a2a_credit_25_once: 2500,
  a2a_credit_100_once: 10000,
  a2a_credit_500_once: 50000,
};

function resolvePriceId(price: any): string | null {
  return price?.lookup_key || price?.metadata?.lovable_external_id || null;
}

async function handleSubscriptionUpsert(subscription: any, env: StripeEnv) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error("subscription event: missing metadata.userId");
    return;
  }
  const item = subscription.items?.data?.[0];
  const priceId = resolvePriceId(item?.price);
  const productId = typeof item?.price?.product === "string" ? item.price.product : item?.price?.product?.id;
  if (!priceId) {
    console.warn("Skipping subscription: missing lookup_key on price", { rawPriceId: item?.price?.id });
    return;
  }
  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;

  await getSupabase().from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      product_id: productId || "",
      price_id: priceId,
      status: subscription.status,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );
}

async function handleSubscriptionDeleted(subscription: any, env: StripeEnv) {
  await getSupabase()
    .from("subscriptions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", subscription.id)
    .eq("environment", env);
}

async function handleCheckoutCompleted(session: any, env: StripeEnv) {
  // Only handle one-time payments here. Subscription checkouts are handled by
  // customer.subscription.created/updated events (richer payload).
  if (session.mode !== "payment") return;
  if (session.payment_status !== "paid") return;

  const stripe = createStripeClient(env);
  const full = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["line_items", "line_items.data.price"],
  });
  const items: any[] = (full as any).line_items?.data || [];
  const md = full.metadata || {};
  const userId = md.userId as string | undefined;
  const a2aPartnerId = md.a2aPartnerId as string | undefined;
  const supabase = getSupabase();

  // A2A partner top-up
  if (a2aPartnerId) {
    let creditCents = 0;
    for (const item of items) {
      const priceId = resolvePriceId(item.price);
      if (priceId && A2A_CREDIT_MAP[priceId]) {
        creditCents += A2A_CREDIT_MAP[priceId] * (item.quantity || 1);
      }
    }
    if (creditCents === 0) return;
    const { data: partner } = await supabase
      .from("a2a_partners")
      .select("balance_cents")
      .eq("id", a2aPartnerId)
      .maybeSingle();
    if (!partner) return;
    await supabase
      .from("a2a_partners")
      .update({
        balance_cents: (partner.balance_cents || 0) + creditCents,
        updated_at: new Date().toISOString(),
      })
      .eq("id", a2aPartnerId);
    return;
  }

  // User email top-up
  if (!userId) return;
  let emailsToAdd = 0;
  for (const item of items) {
    const priceId = resolvePriceId(item.price);
    if (priceId && TOPUP_MAP[priceId]) {
      emailsToAdd += TOPUP_MAP[priceId] * (item.quantity || 1);
    }
  }
  if (emailsToAdd === 0) return;

  const totalCents = full.amount_total || 0;
  await supabase.from("credit_purchases").upsert(
    {
      user_id: userId,
      stripe_session_id: full.id,
      credits_added: emailsToAdd,
      amount_cents: totalCents,
      environment: env,
    },
    { onConflict: "stripe_session_id" },
  );

  const { data: existing } = await supabase
    .from("user_credits")
    .select("balance, total_purchased")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("user_credits")
      .update({
        balance: (existing.balance || 0) + emailsToAdd,
        total_purchased: (existing.total_purchased || 0) + emailsToAdd,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  } else {
    await supabase.from("user_credits").insert({
      user_id: userId,
      balance: emailsToAdd,
      total_purchased: emailsToAdd,
    });
  }
}

async function handleWebhook(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);
  console.log("Stripe event:", event.type, "env:", env);
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await handleSubscriptionUpsert(event.data.object, env);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object, env);
      break;
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object, env);
      break;
    default:
      console.log("Unhandled event:", event.type);
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const rawEnv = new URL(req.url).searchParams.get("env");
  if (rawEnv !== "sandbox" && rawEnv !== "live") {
    console.error("Webhook received with invalid or missing env query parameter:", rawEnv);
    return new Response(JSON.stringify({ received: true, ignored: "invalid env" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  const env: StripeEnv = rawEnv;
  try {
    await handleWebhook(req, env);
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response("Webhook error", { status: 400 });
  }
});
