
# Email Top-Up Packs — Stripe + Bonus Bucket

Wire the three packs already shown on the Rate Limits page into real Stripe checkout and credit the user's account when payment succeeds.

## Packs

| Pack | Emails | Price | Effective |
|---|---|---|---|
| `topup_500` | +500 | $12 | $0.024 / email |
| `topup_1000` | +1,000 | $22 | $0.022 / email |
| `topup_2500` | +2,500 | $45 | $0.018 / email |

All one-time payments (not subscriptions). Eligible for full compliance handling (digital service, SaaS tax code `txcd_10103001`), so I'll enable `managed_payments: { enabled: true }` on these sessions (+3.5% per transaction, can be turned off later).

## Bonus-email behavior

Top-ups go into a **separate bucket from the weekly subscription cap** and **roll over until consumed**. This matches the value prop ("buy extra, don't lose it Monday") and keeps weekly reset logic untouched.

Enforcement order at send time: weekly subscription cap first, then bonus bucket. This way bonus emails only get spent after the included weekly allowance is exhausted.

## Changes

### 1. Database (migration)
- New table `public.email_topups` — `user_id`, `emails_granted`, `emails_remaining`, `amount_cents`, `stripe_session_id` (unique, idempotency), `price_id`, `environment`, timestamps. RLS: user can SELECT own; service_role full access.
- Update `public.current_week_caps(_user_id)` to also return `bonus_emails_remaining` (sum of `emails_remaining` across user's top-ups).
- New SQL function `public.consume_bonus_emails(_user_id uuid, _amount int)` — SECURITY DEFINER, decrements oldest-first (FIFO), returns how many were consumed. Used by the send pipeline after the weekly cap is hit.

### 2. Stripe products
Create 3 one-time products via `batch_create_product` with lookup keys `topup_500`, `topup_1000`, `topup_2500`, tax code `txcd_10103001`, `quantity_min/max = 1`.

### 3. Edge functions
- **`create-checkout`** (existing) — already resolves by `lookup_key` and picks `mode` based on price type, so it works for one-time prices unchanged. Add `managed_payments: { enabled: true }` for one-time sessions and a `payment_intent_data.description` from the Stripe product name.
- **`payments-webhook`** (existing) — add `checkout.session.completed` handler: for one-time `mode: "payment"` sessions whose price `lookup_key` starts with `topup_`, upsert a row into `email_topups` keyed on `stripe_session_id` (idempotent), granting the corresponding emails.

### 4. Frontend — Rate Limits page
Replace the static "Buy" buttons on the three top-up cards with a handler that calls `useStripeCheckout({ priceId: 'topup_500' | 'topup_1000' | 'topup_2500', userId, customerEmail, returnUrl })` and renders the embedded checkout inline (modal/drawer, same pattern used for subscription checkout). On return, show a toast "+N emails added to your account" and refresh caps.

### 5. UI surfacing of bonus bucket
- Rate Limits page header: under the weekly meter, add a small line "Bonus emails: X remaining (rolls over)".
- Dashboard caps widget: same secondary line.
- Send pipeline: when weekly cap is reached but `bonus_emails_remaining > 0`, allow the send and call `consume_bonus_emails`. When both are zero, block with the existing cap-reached message + CTA to the Rate Limits page.

### 6. Memory update
Update `mem://features/pricing` and the Core memory rule — the "no pay-as-you-go packs" line is no longer accurate. New rule: weekly subs are the primary model; one-time email top-ups exist as overflow only ($12 / $22 / $45) and roll over.

## Out of scope
- LinkedIn top-ups (assist-only, no caps to top up).
- Refunds / expirations on bonus emails.
- Auto-recharge.
