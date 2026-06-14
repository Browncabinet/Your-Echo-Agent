import { loadStripe, Stripe } from "@stripe/stripe-js";
import { supabase } from "@/integrations/supabase/client";

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;
const liveKey = import.meta.env.VITE_STRIPE_LIVE_PUBLISHABLE_KEY;

// Prefer the user's own pk_live_ key when configured; otherwise fall back to
// Lovable's gateway client token. Environment is derived from whichever key wins.
const activeKey = liveKey?.startsWith('pk_live_') ? liveKey : clientToken;
const environment = activeKey?.startsWith('pk_live_') ? 'live' : 'sandbox';

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    if (!activeKey) {
      throw new Error("No Stripe publishable key configured (VITE_STRIPE_LIVE_PUBLISHABLE_KEY or VITE_PAYMENTS_CLIENT_TOKEN)");
    }
    stripePromise = loadStripe(activeKey);
  }
  return stripePromise;
}

export async function getStripePriceId(priceId: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("get-stripe-price", {
    body: { priceId, environment },
  });
  if (error || !data?.stripeId) {
    throw new Error(`Failed to resolve price: ${priceId}`);
  }
  return data.stripeId;
}

export function getStripeEnvironment(): string {
  return environment;
}
