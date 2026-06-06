---
name: Usage Caps & Weekly Reset
description: Weekly email and LinkedIn caps enforced server-side via current_week_caps SQL function
type: feature
---
Weekly quotas reset every Monday (UTC, via `date_trunc('week', now())`). Caps are derived from the user's active Stripe subscription `price_id` by the `public.current_week_caps(_user_id)` function which returns `tier`, `email_cap`, `linkedin_cap`, `emails_used`, `linkedin_used`, `week_start`, `subscription_active`.

**Storage**
- `public.subscriptions` — active plan per user (one current row + history). Service-role writes, user can SELECT own.
- `public.weekly_usage` — `(user_id, week_start)` unique; columns `emails_sent`, `linkedin_actions`. Service-role writes, user can SELECT own.

**Enforcement points**
- `send-campaign-emails`: blocks with HTTP 402 when cap exhausted; falls back to legacy `user_credits` balance (welcome 50) if no active subscription. Increments `weekly_usage.emails_sent` after successful sends.
- `linkedin-assist`: blocks with 402 (no plan) / 429 (cap hit); increments `weekly_usage.linkedin_actions` per generation.

**Frontend**
- `useSubscription()` hook subscribes to realtime changes on both tables and re-runs `current_week_caps`.
- `WeeklyUsageStrip` shows tier + progress bars + Manage button (opens Stripe Billing Portal via `create-portal-session`).
