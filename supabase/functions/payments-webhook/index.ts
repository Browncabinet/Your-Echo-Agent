import { createClient } from "npm:@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { type StripeEnv, verifyWebhook, createStripeClient } from "../_shared/stripe.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Map price IDs to credit amounts
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
  const env = (url.searchParams.get('env') || 'sandbox') as StripeEnv;

  try {
    const event = await verifyWebhook(req, env);
    console.log("Received event:", event.type, "env:", env);

    switch (event.type) {
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

async function handleCheckoutCompleted(session: any, env: StripeEnv) {
  if (session.mode !== "payment") return;

  const userId = session.metadata?.userId;
  if (!userId) {
    console.error("No userId in session metadata");
    return;
  }

  // Retrieve line items to determine which credit pack was purchased
  const stripe = createStripeClient(env);
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { expand: ['data.price'] });
  
  let creditsToAdd = 0;
  let amountCents = session.amount_total || 0;

  for (const item of lineItems.data) {
    const lookupKey = (item.price as any)?.lookup_key;
    if (lookupKey && CREDIT_MAP[lookupKey]) {
      creditsToAdd += CREDIT_MAP[lookupKey] * (item.quantity || 1);
    }
  }

  if (creditsToAdd === 0) {
    console.error("Could not determine credits for session:", session.id);
    return;
  }

  // Log the purchase (idempotent via unique stripe_session_id)
  const { error: purchaseError } = await supabase.from("credit_purchases").upsert(
    {
      user_id: userId,
      stripe_session_id: session.id,
      credits_added: creditsToAdd,
      amount_cents: amountCents,
      environment: env,
    },
    { onConflict: "stripe_session_id" }
  );

  if (purchaseError) {
    console.error("Failed to log purchase:", purchaseError);
    return;
  }

  // Upsert user credits — add to balance
  const { data: existing } = await supabase
    .from("user_credits")
    .select("balance, total_purchased")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("user_credits")
      .update({
        balance: existing.balance + creditsToAdd,
        total_purchased: existing.total_purchased + creditsToAdd,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  } else {
    // Use service role insert (bypasses RLS)
    await supabase.from("user_credits").insert({
      user_id: userId,
      balance: 50 + creditsToAdd, // 50 free + purchased
      total_purchased: creditsToAdd,
    });
  }

  console.log(`Added ${creditsToAdd} credits for user ${userId}`);
}
