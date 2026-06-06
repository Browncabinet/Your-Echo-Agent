---
name: Pricing Model
description: Three weekly subscription tiers, weekly email/LinkedIn caps that reset every Monday, no rollover
type: feature
---
Three weekly subscription tiers replace the old pay-as-you-go email packs:

| Tier    | Price   | Emails/wk | LinkedIn Assist actions/wk |
|---------|---------|-----------|----------------------------|
| Starter | $19/wk  | 500       | 50                         |
| Growth  | $39/wk  | 1,500     | 150                        |
| Power   | $79/wk  | 4,000     | 400                        |

Stripe price IDs: `starter_weekly`, `growth_weekly`, `power_weekly` (lookup keys, stable across sandbox/live).

**Rules**
- Volume-only differentiation — every feature available on all tiers.
- Weekly reset every Monday (UTC). No rollover.
- Cancellation: access continues until current week ends.
- Caps enforced in `send-campaign-emails` and `linkedin-assist` edge functions via the `current_week_caps(user_id)` SQL function.
- Counters live in `public.weekly_usage` (`user_id, week_start, emails_sent, linkedin_actions`).
- Active sub stored in `public.subscriptions` and populated by `payments-webhook` from `customer.subscription.*` events.
- Welcome bonus: 50 free emails on signup via legacy `user_credits` table; used when no active sub.
- Checkout uses `managed_payments: { enabled: true }` (Stripe handles tax/fraud/disputes; +3.5% per tx; bank descriptor `LINK.COM*`).
- Subscription management opens Stripe Billing Portal via `create-portal-session` edge function (new tab).
