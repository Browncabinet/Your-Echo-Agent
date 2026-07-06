# Switch payments from Stripe to Paddle

## 1. Create Paddle product catalog (test env, auto-syncs on publish)

Weekly subscriptions (recurring, week):
- `starter_weekly` — Starter Weekly — $19
- `growth_weekly` — Growth Weekly — $39
- `power_weekly` — Power Weekly — $79

Top-up packs (one-time):
- `topup_500` — +500 emails — $12
- `topup_1000` — +1,000 emails — $22
- `topup_2500` — +2,500 emails — $45

## 2. Database

- Drop legacy unique constraint on `subscriptions(user_id, environment)` if present; keep `paddle_subscription_id` unique.
- Rename/alias columns as needed so webhook handler can upsert with `onConflict: 'paddle_subscription_id'`. Existing `subscriptions` schema already has `price_id`, `product_id`, `status`, `current_period_end`, `environment` — reuse.
- `credit_purchases` table already exists — webhook will insert on `transaction.completed` for top-up prices and increment `user_credits.balance`.

## 3. Edge functions (new)

- `supabase/functions/_shared/paddle.ts` — canonical shared util (`getPaddleClient`, `gatewayFetch`, `verifyWebhook`).
- `supabase/functions/get-paddle-price/index.ts` — resolve human-readable price ID → Paddle internal ID.
- `supabase/functions/payments-webhook/index.ts` — verify signature, handle `subscription.created/updated/canceled` (upsert subscriptions) and `transaction.completed` (if price is a top-up, insert `credit_purchases` and increment `user_credits.balance`). Uses `customData.userId`.
- `supabase/functions/paddle-customer-portal/index.ts` — create portal session for cancel/update payment.

## 4. Frontend

- `src/lib/paddle.ts` — `initializePaddle`, `getPaddleEnvironment`, `getPaddlePriceId`.
- `src/hooks/usePaddleCheckout.ts` — opens overlay checkout with `customData: { userId }` and `successUrl`.
- `src/components/PaymentTestModeBanner.tsx` — sandbox banner.
- Update pricing page and "Buy more emails" UI to call `openCheckout({ priceId: 'starter_weekly' | ... })` instead of Stripe.
- Update `useSubscription` hook to filter by `environment = getPaddleEnvironment()`.

## 5. Remove Stripe

- Delete Stripe edge functions (`create-checkout`, `stripe-webhook`, `customer-portal`, etc.).
- Remove `@stripe/*` npm packages and imports.
- Remove `STRIPE_*` secrets from code references (secrets themselves can stay or be deleted later).

## 6. Verify

- Buy `topup_500` in preview with test card `4242 4242 4242 4242` → confirm `credit_purchases` row + `user_credits.balance +500`.
- Subscribe to `starter_weekly` → confirm `subscriptions` row with `status='active'`, `price_id='starter_weekly'`, `environment='sandbox'`.
- Confirm `current_week_caps` SQL fn returns Starter caps (500/50/50).

## Notes

- `current_week_caps` already recognizes `starter_weekly`/`growth_weekly`/`power_weekly` — no SQL change needed for caps.
- Live checkout won't work until you complete Paddle verification via the Payments dashboard after publishing.
