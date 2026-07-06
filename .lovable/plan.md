## Plan

1. **Fix the checkout session setup**
   - Update the checkout function so card payments are explicitly enabled for every embedded Stripe checkout session.
   - Keep the existing embedded checkout flow, price lookup keys, return URL behavior, and user/partner metadata intact.

2. **Make card declines easier to diagnose**
   - Add safe server-side logging around checkout session creation: environment, price lookup key, mode, and payment method setup status.
   - Do not log card details, secrets, tokens, or customer-sensitive payment data.

3. **Verify the payment path**
   - Test session creation for the current A2A top-up price on the billing page.
   - Confirm the returned embedded checkout session is created successfully in sandbox.
   - If a real card is still declined after this, the next likely cause is payment-provider risk/compliance blocking rather than app code, but this change ensures the app is creating sessions with card support correctly.

## Technical details

- Change `supabase/functions/create-checkout/index.ts` only.
- Add `payment_method_types: ["card"]` to `stripe.checkout.sessions.create(...)`.
- Preserve `ui_mode: "embedded_page"` and `payment_intent_data.description` for one-time payments.
- Re-deploy/test the `create-checkout` function after the code change.