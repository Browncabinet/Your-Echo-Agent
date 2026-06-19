## Status: Stripe is already enabled in this project

Good news — you don't need to enable Stripe again. The full integration is already wired up:

- **Test mode key** is active: `VITE_PAYMENTS_CLIENT_TOKEN` starts with `pk_test_` (orange "Payments are in test mode" banner shows)
- **Live secret key** is stored as `STRIPE_LIVE_SECRET_KEY` for when you go live
- **Webhook secrets** present: `PAYMENTS_LIVE_WEBHOOK_SECRET`
- **Edge functions live**: `create-checkout`, `payments-webhook`, `create-portal-session`, `get-stripe-price`
- **Checkout UI**: `StripeEmbeddedCheckout`, `TopupCheckoutDialog`, `/checkout/return` page
- **Products configured** with lookup keys: `starter_weekly` ($19), `growth_weekly` ($39), `power_weekly` ($79), plus `topup_500/1000/2500` and A2A credit packs
- **Subscriptions table** + `current_week_caps()` SQL function enforce weekly caps in send functions

## What "enable + test checkout" means here

Since payments are already enabled, the plan is just to **verify the test flow end-to-end** — no code changes needed unless something is broken.

### Steps for you to run (manual, ~3 minutes)
1. Open `/pricing` in the preview
2. Click **Starter ($19/wk)** → Stripe embedded checkout loads
3. Use test card `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP
4. Submit → you should land on `/checkout/return` with success
5. Confirm in DB: a row appears in `subscriptions` with `status=active`, and `current_week_caps()` returns Starter limits for your user

### What I would change in code
**Nothing** — unless step 1–5 fails. If it does, tell me which step and I'll diagnose (likely candidates: webhook secret mismatch, price lookup_key not created in Stripe sandbox, or return URL).

### When you're ready for live payments
Separate flow — you'd claim the Stripe account in the Lovable Payments panel, then I can swap `VITE_PAYMENTS_CLIENT_TOKEN` to the live `pk_live_` key. Tell me when you want to do that.

---

**Confirm:** Do you want to (a) just run the test checkout above and report back, or (b) have me proactively verify the sandbox `starter_weekly` price exists and the webhook is firing before you test?