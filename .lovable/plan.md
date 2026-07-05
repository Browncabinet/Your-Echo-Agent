Migrate the existing bring-your-own-key Stripe integration to Lovable's built-in Stripe payments (seamless). This replaces manual edge-function checkout/portal/webhook plumbing with Lovable-managed infrastructure.

## Phase 1 — Enable built-in payments & discover API
1. Call `payments--enable_stripe_payments` to activate the integration.
2. Inspect what the built-in system exposes (e.g. product/price IDs, checkout session API, portal session API, webhook endpoint).
3. Determine if the built-in webhooks automatically update `subscriptions`/`user_credits` or if custom webhook logic must be preserved.

## Phase 2 — Recreate products
1. Create the 6 products in the built-in Stripe system:
   - Starter Weekly — $19/week (recurring)
   - Growth Weekly — $39/week (recurring)
   - Power Weekly — $79/week (recurring)
   - 500 Email Pack — $12 one-time
   - 1,000 Email Pack — $22 one-time
   - 2,500 Email Pack — $45 one-time
2. Map new built-in price IDs to the app's internal lookup keys (`starter_weekly`, `growth_weekly`, `power_weekly`, `topup_500`, `topup_1000`, `topup_2500`).

## Phase 3 — Update checkout flow
1. Replace `StripeEmbeddedCheckout.tsx` and `create-checkout` edge function with the built-in checkout pattern (likely a simpler Supabase function call or direct SDK usage).
2. Update `Pricing.tsx` to reference the new built-in price identifiers.
3. Replace `create-portal-session` edge function with the built-in portal/billing management API.
4. Update `src/lib/stripe.ts` to use the built-in publishable token instead of `VITE_PAYMENTS_CLIENT_TOKEN`.

## Phase 4 — Update webhook & data layer
1. Decide if `payments-webhook` edge function can be deleted (if built-in webhooks handle subscription state) or if it must be kept for custom logic (credit top-ups, A2A partner credits).
2. If kept: refactor `payments-webhook` to use the built-in Stripe client instead of BYOK keys.
3. Ensure `current_week_caps` SQL function continues to work with the new price identifiers.

## Phase 5 — Cleanup & testing
1. Remove unused BYOK secrets (`STRIPE_LIVE_SECRET_KEY`, `PAYMENTS_LIVE_WEBHOOK_SECRET`, etc.) after confirming built-in flow works.
2. Delete unused edge functions (`create-checkout`, `create-portal-session`, `get-stripe-price` if superseded).
3. Smoke-test:
   - Trial → subscription checkout → portal management → cancel
   - Top-up pack purchase → credit balance update
   - Weekly cap enforcement still correct
