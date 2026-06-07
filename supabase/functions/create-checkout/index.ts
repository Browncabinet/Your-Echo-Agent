import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { type StripeEnv, createStripeClient, resolveOrCreateCustomer } from "../_shared/stripe.ts";

const responseHeaders = {
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, responseHeaders);
  }

  try {
    const { priceId, quantity, customerEmail, userId, returnUrl, environment, metadata: extraMetadata } = await req.json();
    if (!priceId || typeof priceId !== "string" || !/^[a-zA-Z0-9_-]+$/.test(priceId)) {
      return new Response(JSON.stringify({ error: "Invalid priceId" }), { status: 400, ...responseHeaders });
    }

    const env = (environment || "sandbox") as StripeEnv;
    const stripe = createStripeClient(env);

    const prices = await stripe.prices.list({ lookup_keys: [priceId] });
    if (!prices.data.length) {
      return new Response(JSON.stringify({ error: "Price not found" }), { status: 404, ...responseHeaders });
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
      metadata: { ...(userId && { userId, priceId }), managed_payments: "true", ...safeExtra },
      ...(isRecurring && userId && { subscription_data: { metadata: { userId, priceId } } }),
      managed_payments: { enabled: true },
    } as any);

    return new Response(JSON.stringify({ clientSecret: session.client_secret }), responseHeaders);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("create-checkout error:", message);
    return new Response(JSON.stringify({ error: message }), { status: 500, ...responseHeaders });
  }
});
