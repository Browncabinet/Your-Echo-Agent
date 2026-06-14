## Goal

Switch live Stripe payments from the Lovable-managed gateway to your own Stripe account using the secrets you just added: `STRIPE_LIVE_SECRET_KEY`, `STRIPE_LIVE_PUBLISHABLE_KEY`, and `PAYMENTS_LIVE_WEBHOOK_SECRET`. Test/sandbox flow keeps using the existing Lovable-managed gateway untouched.

## What changes

### 1. `supabase/functions/_shared/stripe.ts`
- For `env === 'live'`: build the Stripe SDK client with `STRIPE_LIVE_SECRET_KEY` directly (no gateway proxy, no `LOVABLE_API_KEY` header). This means real calls go straight to `api.stripe.com` using your secret key.
- For `env === 'sandbox'`: leave the existing gateway-proxied client exactly as-is.
- `verifyWebhook` already reads `PAYMENTS_LIVE_WEBHOOK_SECRET` correctly — no change needed.

### 2. `src/lib/stripe.ts` (frontend)
- Add live-publishable-key support: when the environment resolves to `live`, load Stripe.js with `STRIPE_LIVE_PUBLISHABLE_KEY` (exposed via a new `VITE_STRIPE_LIVE_PUBLISHABLE_KEY` env var that mirrors the secret value — publishable keys are safe in the bundle).
- Keep existing `VITE_PAYMENTS_CLIENT_TOKEN` path for sandbox/test.
- Environment detection: if `VITE_STRIPE_LIVE_PUBLISHABLE_KEY` is present and starts with `pk_live_`, use it on the published build; otherwise fall back to the existing client token logic.

### 3. Verify Stripe webhook URL is set
Confirm your Stripe webhook endpoint URL is:
`https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/payments-webhook?env=live`

If you used a URL without `?env=live`, edit it in Stripe → webhook signing will pass but the handler won't know which env to write to.

### 4. No changes to
- Pricing page UI / product IDs
- Checkout session creation logic (`create-checkout`)
- Webhook handler logic (`payments-webhook`)
- Subscription table schema

## What you'll need to do after I ship the code

1. Add a build env var `VITE_STRIPE_LIVE_PUBLISHABLE_KEY` with your `pk_live_...` value (this is a separate field from the runtime secret because Vite bundles it into the frontend at build time).
2. Republish the app so the live publishable key gets into the bundle.
3. Test a live $0.50 purchase to confirm the full flow works end-to-end.

## Risk

This is a one-way switch for live payments only. Sandbox/test mode is untouched and will keep working through the Lovable gateway. If anything is misconfigured, live checkout fails with a clear Stripe error — sandbox testing is unaffected.
