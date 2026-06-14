## Goal
Use your own Stripe live account directly with the secret key you've already added (`STRIPE_LIVE_SECRET_KEY`), instead of waiting on Lovable's seamless go-live flow. Sandbox (test) keeps working as-is through Lovable so you can still preview safely.

## Current state (good news)
You've already provided everything needed:
- `STRIPE_LIVE_SECRET_KEY` ✅
- `STRIPE_LIVE_PUBLISHABLE_KEY` ✅
- `STRIPE_LIVE_NETWORK_ID` ✅
- `PAYMENTS_LIVE_WEBHOOK_SECRET` ✅ (will be replaced with the one from YOUR Stripe dashboard)

The shared Stripe helper (`supabase/functions/_shared/stripe.ts`) **already** routes live calls directly to Stripe using your `STRIPE_LIVE_SECRET_KEY` when present, and the client (`src/lib/stripe.ts`) **already** uses your hardcoded `pk_live_...` publishable key. So 80% of the wiring is done.

## What needs to change

### 1. Remove Lovable-managed-only features from checkout
`supabase/functions/create-checkout/index.ts` currently sends `managed_payments: { enabled: true }`. That's a Lovable seamless-Stripe feature and Stripe will reject it on your own live account. I'll remove that line and the `managed_payments: "true"` metadata flag.

### 2. Replace the live webhook secret with yours
The current `PAYMENTS_LIVE_WEBHOOK_SECRET` was issued by Lovable's seamless flow. Your own Stripe account uses a different one. After my code change, you'll need to:

1. Open your live Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. Endpoint URL:
   `https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/payments-webhook?env=live`
3. Select events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `checkout.session.completed`
4. After creating, click "Reveal" the signing secret (`whsec_...`) and paste it when I prompt you via the secrets tool to update `PAYMENTS_LIVE_WEBHOOK_SECRET`.

### 3. Recreate your products/prices in YOUR live Stripe account
Any products you created through Lovable's sandbox live in Lovable's managed Stripe — not yours. You'll need them in your own live account with the same **lookup keys** (e.g. `starter_weekly`, `growth_weekly`, `power_weekly`) so checkout resolves them.

I'll either:
- (a) Write a one-off script you run once that creates the 3 weekly subscription products + prices in your live account with matching lookup keys, OR
- (b) Walk you through creating them manually in the Stripe dashboard

(Recommend option a — faster and prevents typos in lookup keys.)

### 4. Verify
- Preview keeps using sandbox (test cards still work).
- Published site uses your live Stripe — I'll do a smoke check on the deployed `create-checkout` and `payments-webhook` functions.

## Files I'll edit
- `supabase/functions/create-checkout/index.ts` — remove `managed_payments` payload + metadata
- (optionally) `supabase/functions/setup-byok-products/index.ts` — one-off script to seed products in your live account

## What I need from you AFTER code is deployed
1. Create the webhook in your Stripe Dashboard (URL above) and paste the new `whsec_...` when prompted.
2. Confirm whether you want me to script the product creation or do it manually.

## Out of scope
- Disconnecting the Lovable-managed Stripe sandbox (you can leave it — sandbox stays useful for testing). If you want it fully removed later, you do that from the Payments dashboard's three-dots menu.
