import { loadStripe, Stripe } from "@stripe/stripe-js";
import { supabase } from "@/integrations/supabase/client";

// Hardcoded live publishable key (safe to commit — publishable keys are public).
const HARDCODED_LIVE_KEY = "pk_live_51ThA7rDC0NTHQ87sRfjpfakI3ILuGmSsAekff0g5tqmGA5EGX648PrbLCCrhPh3Qa3d3SpbQngfOJAXw0Tk7F3oQ0014BSVu7Y";

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;
const liveKey = import.meta.env.VITE_STRIPE_LIVE_PUBLISHABLE_KEY || HARDCODED_LIVE_KEY;

// Prefer the pk_live_ key; fall back to Lovable's gateway client token.
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
