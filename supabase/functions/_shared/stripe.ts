import { encode } from "https://deno.land/std@0.168.0/encoding/hex.ts";
import Stripe from "https://esm.sh/stripe@22.0.2";

const getEnv = (key: string): string => {
  const value = Deno.env.get(key);
  if (!value) throw new Error(`${key} is not configured`);
  return value;
};

export type StripeEnv = "sandbox" | "live";

const GATEWAY_STRIPE_BASE = "https://connector-gateway.lovable.dev/stripe";

export function getConnectionApiKey(env: StripeEnv): string {
  return env === "sandbox"
    ? getEnv("STRIPE_SANDBOX_API_KEY")
    : getEnv("STRIPE_LIVE_API_KEY");
}

export function createStripeClient(env: StripeEnv): Stripe {
  const connectionApiKey = getConnectionApiKey(env);
  const lovableApiKey = getEnv("LOVABLE_API_KEY");

  return new Stripe(connectionApiKey, {
    apiVersion: "2026-03-25.dahlia",
    httpClient: Stripe.createFetchHttpClient((input, init) => {
      const stripeUrl = input instanceof Request ? input.url : input.toString();
      const gatewayUrl = stripeUrl.replace("https://api.stripe.com", GATEWAY_STRIPE_BASE);
      return fetch(gatewayUrl, {
        ...init,
        headers: {
          ...Object.fromEntries(
            new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined)).entries(),
          ),
          "X-Connection-Api-Key": connectionApiKey,
          "Lovable-API-Key": lovableApiKey,
        },
      });
    }),
  });
}

async function computeSignature(secret: string, timestamp: string, body: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${body}`),
  );
  return new TextDecoder().decode(encode(new Uint8Array(signed)));
}

export async function verifyWebhook(
  req: Request,
  env: StripeEnv,
): Promise<{ type: string; data: { object: any } }> {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();
  if (!signature || !body) throw new Error("Missing signature or body");

  let timestamp: string | undefined;
  const v1Signatures: string[] = [];
  for (const part of signature.split(",")) {
    const [key, value] = part.split("=", 2);
    if (key === "t") timestamp = value;
    if (key === "v1") v1Signatures.push(value);
  }
  if (!timestamp || v1Signatures.length === 0) throw new Error("Invalid signature format");

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (age > 300) throw new Error("Webhook timestamp too old");

  // Try the expected secret first, then fall back to the other environment's
  // secret. This recovers from a common post-go-live misconfiguration where
  // the live Stripe webhook endpoint was created with the sandbox signing
  // secret (or vice versa). We log which one matched so the mismatch is
  // visible and fixable.
  const primaryName = env === "sandbox" ? "PAYMENTS_SANDBOX_WEBHOOK_SECRET" : "PAYMENTS_LIVE_WEBHOOK_SECRET";
  const fallbackName = env === "sandbox" ? "PAYMENTS_LIVE_WEBHOOK_SECRET" : "PAYMENTS_SANDBOX_WEBHOOK_SECRET";

  const candidates: Array<{ name: string; secret: string }> = [];
  const primary = Deno.env.get(primaryName);
  if (primary) candidates.push({ name: primaryName, secret: primary });
  const fallback = Deno.env.get(fallbackName);
  if (fallback && fallback !== primary) candidates.push({ name: fallbackName, secret: fallback });

  if (candidates.length === 0) throw new Error(`${primaryName} is not configured`);

  for (const cand of candidates) {
    const expected = await computeSignature(cand.secret, timestamp, body);
    if (v1Signatures.includes(expected)) {
      if (cand.name !== primaryName) {
        console.warn(
          `[verifyWebhook] env=${env} matched via ${cand.name} (expected ${primaryName}). ` +
          `Live/sandbox webhook signing secret is likely swapped in Stripe or the env var.`,
        );
      }
      return JSON.parse(body);
    }
  }

  console.error(
    `[verifyWebhook] env=${env} signature did not match any configured secret ` +
    `(tried: ${candidates.map((c) => c.name).join(", ")}). ` +
    `Check that the Stripe ${env} endpoint's signing secret matches ${primaryName}.`,
  );
  throw new Error("Invalid webhook signature");
}
