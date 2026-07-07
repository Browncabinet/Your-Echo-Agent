## Problem

Your $25 payment succeeded on Stripe's side (checkout logs confirm `create-checkout session created … env: "live", priceId: "a2a_credit_25_once"`), but your partner balance never went up.

Root cause is in the payments webhook logs:

```
Webhook error: Error: Invalid webhook signature
  at verifyWebhook (_shared/stripe.ts:54)
  at handleWebhook (payments-webhook/index.ts:139)
```

Stripe is delivering the `checkout.session.completed` event to `payments-webhook?env=live`, but the function is rejecting it because the signature doesn't match. That means `handleCheckoutCompleted` never runs, so `a2a_partners.balance_cents` is never incremented. This is why the UI still shows $0.

The signature mismatch is almost always one of:
1. `PAYMENTS_LIVE_WEBHOOK_SECRET` in this project doesn't match the signing secret shown on the live Stripe webhook endpoint (e.g. secret was rotated in Stripe, or the wrong endpoint's secret is stored).
2. The Stripe webhook endpoint is pointing at a URL that strips/rewrites the body (must be the raw edge function URL with `?env=live`).

## Plan

### 1. Credit your $25 manually (one-time fix)
Look up your `a2a_partners` row and add `2500` cents to `balance_cents` so your live balance reflects the payment you already made. Verify via the /for-agents/billing page.

### 2. Fix the webhook so future top-ups auto-credit
- Confirm the live Stripe webhook endpoint URL is:
  `https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/payments-webhook?env=live`
  and is subscribed to at least `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`.
- Copy the **Signing secret** from that exact endpoint in Stripe (starts with `whsec_…`).
- Update the `PAYMENTS_LIVE_WEBHOOK_SECRET` secret in this project to that value.
- Trigger a redelivery of the failed event from the Stripe dashboard (Webhooks → endpoint → recent event → "Resend") and confirm the function returns 200 and the balance updates.

### 3. Add a small safety net on `/checkout/return`
Right now `CheckoutReturn.tsx` just calls `refresh()` once after 2s. For A2A top-ups the credited balance lives on `a2a_partners`, not `user_credits`, so `refresh()` doesn't even reflect it — and if the webhook is delayed you see $0.

Add short polling on the A2A billing page (or on the return page when the session was an A2A pack) that re-fetches `a2a_partners.balance_cents` every ~2s for up to ~20s after return, with a friendly "Finalizing your top-up…" state and a fallback message if it hasn't landed. This matches the pattern we already use elsewhere for post-checkout balance sync.

## Technical notes

- Files touched (build phase): `src/pages/PartnerBilling.tsx` (or `CheckoutReturn.tsx`) — add polling hook against `a2a_partners` for the signed-in partner. No schema changes.
- Manual credit uses an `UPDATE public.a2a_partners SET balance_cents = balance_cents + 2500, updated_at = now() WHERE id = '<your partner id>';` migration (I'll confirm the partner id before running).
- No changes to `payments-webhook/index.ts` logic itself — the A2A branch in `handleCheckoutCompleted` is correct; it just never runs today because of the signature failure.

## What I need from you before I build

1. Confirm you want me to (a) manually credit the $25 now AND (b) walk you through updating `PAYMENTS_LIVE_WEBHOOK_SECRET`, or just one of those.
2. Confirm the email on the Stripe account that made the purchase so I can find the right `a2a_partners` row.
