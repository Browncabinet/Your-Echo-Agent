## Goal

Bypass the stuck sandbox-claim flow by switching payments to a **manual Stripe (BYOK)** setup using your own Stripe keys from `natashasoleil75@gmail.com`'s live Stripe account.

## What this changes

Today the app routes Stripe calls through Lovable's connector gateway (`connector-gateway.lovable.dev/stripe`) using opaque connection keys. With manual/BYOK, the app talks to `api.stripe.com` directly using **your real Stripe secret key**. Managed payments (Lovable's +3.5% tax/dispute handling) will no longer apply — you handle tax/disputes via your Stripe dashboard.

## Plan

1. **Collect 3 secrets from your Stripe dashboard** (I'll request them via the secure secrets form):
   - `STRIPE_SECRET_KEY` — live `sk_live_...` (or test `sk_test_...` if you want to test first)
   - `STRIPE_PUBLISHABLE_KEY` — matching `pk_live_...` / `pk_test_...`
   - `STRIPE_WEBHOOK_SECRET` — `whsec_...` from a webhook endpoint you'll create

2. **Rewrite `supabase/functions/_shared/stripe.ts`** to instantiate Stripe directly with `STRIPE_SECRET_KEY` (no gateway proxy, no `Lovable-API-Key`, no `X-Connection-Api-Key`).

3. **Update `create-checkout`**:
   - Remove `managed_payments: { enabled: true }` (BYOK doesn't support it).
   - Add `automatic_tax: { enabled: true }` so Stripe still calculates tax (you handle filing).
   - Keep embedded checkout, customer resolution, and metadata as-is.

4. **Update `payments-webhook`** to verify signatures with `STRIPE_WEBHOOK_SECRET` instead of `PAYMENTS_SANDBOX_WEBHOOK_SECRET` / `PAYMENTS_LIVE_WEBHOOK_SECRET`.

5. **Update the frontend**:
   - `src/lib/stripe.ts` reads `STRIPE_PUBLISHABLE_KEY` from a public env var (or fetches it from a small edge function) instead of `VITE_PAYMENTS_CLIENT_TOKEN`.
   - `PaymentTestModeBanner` keys off the publishable-key prefix the same way.

6. **You create the webhook endpoint in Stripe**:
   - URL: `https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/payments-webhook`
   - Events: `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.paid`, `invoice.payment_failed`
   - Copy the signing secret → paste into the `STRIPE_WEBHOOK_SECRET` prompt.

7. **You create products/prices in your Stripe dashboard** matching the lookup keys the app already uses:
   - `starter_weekly`, `growth_weekly`, `power_weekly` (subscriptions, $19/$39/$79/week)
   - `test_payment_1` (one-time $1, for the `/checkout/test` page)
   - Each price must have its `lookup_key` set to the exact slug above — the checkout function resolves prices by `lookup_keys`.

8. **Test in preview** at `/checkout/test` with card `4242 4242 4242 4242`, any future expiry, any CVC. If you used `sk_test_`, this charges nothing real. Verify the webhook fires in Stripe → Developers → Webhooks → recent deliveries.

## Where you do work vs. where I do work

| Step | Who |
|---|---|
| 1, 6, 7 | You, in your Stripe dashboard |
| 2–5 | Me, in code |
| 8 | You, in the preview |

## Important trade-offs

- **No Lovable-managed tax/disputes** — you become responsible for sales tax registration, filing, and chargebacks. Stripe Tax can still calculate; you file.
- **Go-live UI in Lovable will stay "incomplete"** because we're not using its built-in payments. That's expected and harmless.
- **Live vs test** — pick one set of keys at a time. I recommend starting with `sk_test_` + `pk_test_` keys to confirm the wiring, then swapping to live.

## Confirm before I switch to build mode

- Start with **test keys first** (recommended), or go straight to **live keys**?
- Confirm you'll create the products/prices in Stripe with the exact lookup keys listed in step 7.