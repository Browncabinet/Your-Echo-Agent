## Goal
Let you run a successful sandbox Stripe payment end-to-end from your app.

## Current state
Stripe sandbox is already wired up:
- `STRIPE_SANDBOX_API_KEY` + `PAYMENTS_SANDBOX_WEBHOOK_SECRET` configured
- `VITE_PAYMENTS_CLIENT_TOKEN` (pk_test_...) in `.env.development`
- Edge functions `create-checkout`, `payments-webhook`, `get-stripe-price` deployed
- `StripeEmbeddedCheckout` component + `getStripe` helper exist
- `/checkout/return` page exists
- `PartnerBilling` already uses embedded checkout against `a2a_credit_*` products

What's missing: a one-click test entry point with a known-good $1 sandbox price.

## Plan

1. **Create a $1 sandbox test product** via the payments tool:
   - `product_id: test_payment`, `price_id: test_payment_1`, $1.00 USD, one-time, qty 1.

2. **Add `/checkout-test` page** (`src/pages/CheckoutTest.tsx`):
   - Heading "Sandbox Checkout Test", short note that this charges $1 in test mode (no real money).
   - Test card hint: `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP.
   - "Start test checkout" button opens a dialog with `<StripeEmbeddedCheckout priceId="test_payment_1" returnUrl=".../checkout/return?...">`.
   - Includes `<PaymentTestModeBanner />` at top.

3. **Register route** in `src/App.tsx`: `/checkout-test` → `CheckoutTest`.

4. **Verify `/checkout/return`** renders a success state from `session_id` (already does — just confirm).

## How you'll test
1. Open `/checkout-test` in the preview
2. Click "Start test checkout"
3. Pay with `4242 4242 4242 4242`
4. Stripe redirects to `/checkout/return?session_id=...` showing success
5. Edge function logs (`payments-webhook`) show `checkout.session.completed` event

## Out of scope
- No changes to existing pricing, subscriptions, or partner billing flow
- No new DB tables — webhook already handles subscription events; one-time test payment doesn't need persistence
- No production / live-mode changes
