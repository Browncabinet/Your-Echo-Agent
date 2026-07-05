import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient, resolveOrCreateCustomer } from "../_shared/stripe.ts";

const responseHeaders = {
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
  },
};

// Allowlist of Stripe Price lookup_keys this checkout supports.
// Create matching Prices in Stripe (Dashboard → Products → Add price → "Lookup key")
// with these exact strings. Recurring keys are subscriptions; one-time keys are payments.
const ALLOWED_LOOKUP_KEYS = new Set<string>([
  // Weekly subscriptions (current pricing model)
  "starter_weekly",
  "growth_weekly",
  "power_weekly",
  // One-time top-ups — pay-as-you-go per promotion
  "topup_500",
  "topup_1000",
  "topup_2500",
]);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, responseHeaders);
  }

  try {
    const { priceId, quantity, customerEmail, returnUrl, environment, metadata: extraMetadata } = await req.json();

    // Auth: resolve userId from the caller's JWT — never trust a body-supplied userId.
    let userId: string | undefined;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const sb = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
      );
      const { data } = await sb.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = data?.user?.id;
    }

    if (!priceId || typeof priceId !== "string" || !/^[a-zA-Z0-9_-]+$/.test(priceId)) {
      return new Response(JSON.stringify({ error: "Invalid priceId" }), { status: 400, ...responseHeaders });
    }
    if (!ALLOWED_LOOKUP_KEYS.has(priceId)) {
      return new Response(JSON.stringify({ error: `Unknown priceId: ${priceId}` }), { status: 400, ...responseHeaders });
    }

    if (environment !== "sandbox" && environment !== "live") {
      return new Response(JSON.stringify({ error: "Invalid environment" }), { status: 400, ...responseHeaders });
    }
    const env: StripeEnv = environment;
    const stripe = createStripeClient(env);

    const prices = await stripe.prices.list({ lookup_keys: [priceId], active: true, limit: 1 });
    if (!prices.data.length) {
      return new Response(
        JSON.stringify({ error: `No active Stripe Price found with lookup_key "${priceId}". Create one in Stripe with this exact lookup key.` }),
        { status: 404, ...responseHeaders },
      );
    }

    const stripePrice = prices.data[0];
    const isRecurring = stripePrice.type === "recurring";

    const customerId = (customerEmail || userId)
      ? await resolveOrCreateCustomer(stripe, { email: customerEmail, userId })
      : undefined;

    let productDescription: string | undefined;
    if (!isRecurring) {
      const productId = typeof stripePrice.product === "string"
        ? stripePrice.product
        : (stripePrice.product as any).id;
      const product = await stripe.products.retrieve(productId);
      productDescription = product.name;
    }

    // Sanitize extra metadata: only string keys/values, max 50 keys, max 500 chars per value
    const safeExtra: Record<string, string> = {};
    if (extraMetadata && typeof extraMetadata === "object") {
      for (const [k, v] of Object.entries(extraMetadata).slice(0, 50)) {
        if (typeof v === "string" || typeof v === "number") {
          safeExtra[k.slice(0, 40)] = String(v).slice(0, 500);
        }
      }
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: stripePrice.id, quantity: quantity || 1 }],
      mode: isRecurring ? "subscription" : "payment",
      ui_mode: "embedded",
      return_url: returnUrl || `${req.headers.get("origin")}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      ...(customerId && { customer: customerId }),
      ...(!isRecurring && productDescription && { payment_intent_data: { description: productDescription } }),
      metadata: { ...(userId && { userId, priceId }), ...safeExtra },
      ...(isRecurring && userId && { subscription_data: { metadata: { userId, priceId } } }),
    } as any);

    return new Response(JSON.stringify({ clientSecret: session.client_secret }), responseHeaders);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("create-checkout error:", message);
    return new Response(JSON.stringify({ error: message }), { status: 500, ...responseHeaders });
  }
});
