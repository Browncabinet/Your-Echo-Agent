## Goal
Restore payment checkout and prevent the same breakage from recurring after manual Stripe secret changes.

## What I found
- The frontend is hardcoded to prefer a live publishable key, so preview checkout is being routed to `live` instead of the working sandbox token.
- The backend has a custom/manual live secret bypass in `_shared/stripe.ts`; this conflicts with Lovable’s normal gateway flow and uses an older Stripe SDK/API version.
- Live payment go-live is still incomplete, so live checkout may fail even if manual secrets exist.
- `create-portal-session` has a broken auth call, which affects “Manage subscription”.
- `/checkout-test` is public and should be protected while debugging payments.

## Fix plan
1. **Restore safe environment selection**
   - Update `src/lib/stripe.ts` so it derives sandbox/live only from `VITE_PAYMENTS_CLIENT_TOKEN`.
   - Remove the hardcoded live publishable key fallback that forces preview into live.
   - Show a clear configuration error instead of silently routing to live when the token is missing.

2. **Keep manual live secrets supported without breaking preview**
   - Update `supabase/functions/_shared/stripe.ts` to use the current gateway-compatible Stripe utility for sandbox.
   - Preserve live BYOK support only when `STRIPE_LIVE_SECRET_KEY` is present and starts with `sk_`.
   - Validate the environment strictly as `sandbox` or `live` in payment functions.

3. **Fix checkout session creation**
   - Keep Embedded Checkout.
   - Use the Stripe session mode expected by the current SDK/API.
   - Improve error responses so the UI surfaces the real reason checkout failed.

4. **Fix related payment bugs**
   - Change `create-portal-session` from the broken claims call to a working authenticated user lookup.
   - Protect `/checkout-test` behind sign-in.
   - Align `use-credits` with the current 0-email default and add a realtime refresh listener after top-ups.
   - Remove the old webhook path that can add an unintended extra 50 emails to first-time purchasers.

5. **Validate after implementation**
   - Deploy/test the payment edge functions.
   - Call `create-checkout` in sandbox for a known price such as `topup_500`.
   - Check function logs and browser/network errors to confirm the checkout client secret is returned.