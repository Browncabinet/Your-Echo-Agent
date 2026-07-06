## Verify credit-card checkout end-to-end

Your checkout stack is already wired up (create-checkout edge function, embedded checkout dialog, webhook handler). This plan verifies it actually works with a credit card in the running preview and confirms the webhook grants access.

### What I'll verify

1. **Sandbox price resolution** — call `create-checkout` for each of the 6 live price IDs (`starter_weekly`, `growth_weekly`, `power_weekly`, `topup_500`, `topup_1000`, `topup_2500`) and confirm each returns a `clientSecret` (proves lookup_keys resolve after the duplicate cleanup).
2. **Card checkout flow (Playwright)** — sign in to the preview, open pricing, click **Growth Weekly**, and pay with Stripe's test card `4242 4242 4242 4242` inside the embedded checkout iframe. Screenshot before, during, and on the return page.
3. **Webhook side-effects** — after the return page renders, query the DB to confirm:
   - `subscriptions` row exists for the user with `status='active'`, `price_id='growth_weekly'`, `environment='sandbox'`.
   - `current_week_caps(user_id)` returns tier=`growth`, email_cap=1500.
4. **One-time top-up path** — repeat with `topup_1000` and confirm `user_credits.balance` increases by 1000 and a `credit_purchases` row is inserted (idempotent on `stripe_session_id`).
5. **Failure card** — quick run with `4000 0000 0000 0002` (generic decline) to confirm the embedded form surfaces the error and no `subscriptions` row is created.

### What I'll report back

- Screenshots of the checkout dialog, card entry, success return, and failure state.
- DB query results proving the webhook granted access (subscription row + caps).
- Any console errors, network failures, or edge-function log entries surfaced during the run.

### If something fails

I'll diagnose from edge-function logs (`create-checkout`, `payments-webhook`), the network tab, and the DB state — then come back with a fix plan for the specific broken step rather than guessing.

### Notes

- All test runs happen in **sandbox** (preview uses `pk_test_`), so no real money moves.
- No code changes in this pass — verification only. If a bug shows up, I'll propose a follow-up plan.