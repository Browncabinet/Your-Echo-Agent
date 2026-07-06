
-- Rename stripe-specific columns to paddle equivalents
ALTER TABLE public.subscriptions RENAME COLUMN stripe_subscription_id TO paddle_subscription_id;
ALTER TABLE public.subscriptions RENAME COLUMN stripe_customer_id TO paddle_customer_id;
ALTER INDEX IF EXISTS idx_subscriptions_stripe_id RENAME TO idx_subscriptions_paddle_id;

ALTER TABLE public.credit_purchases RENAME COLUMN stripe_session_id TO paddle_transaction_id;
