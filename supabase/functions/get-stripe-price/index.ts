import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

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

  const { priceId, environment } = await req.json();
  if (!priceId || typeof priceId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(priceId)) {
    return new Response(JSON.stringify({ error: "Invalid priceId" }), { status: 400, ...responseHeaders });
  }

  const env = (environment || 'sandbox') as StripeEnv;
  const stripe = createStripeClient(env);

  const prices = await stripe.prices.list({ lookup_keys: [priceId] });
  if (!prices.data.length) {
    return new Response(JSON.stringify({ error: "Price not found" }), { status: 404, ...responseHeaders });
  }

  return new Response(JSON.stringify({ stripeId: prices.data[0].id }), responseHeaders);
});
