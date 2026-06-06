
## Goal

Replace the pay-as-you-go email packs with three weekly subscriptions and add a LinkedIn assist module that respects the platform's real API limits.

## Important LinkedIn reality (must read before approving)

LinkedIn's official API **does not** allow third-party apps to:
- Search/discover groups, organizations, or associations
- Read members of a group
- Comment on third-party posts on a user's behalf
- Send DMs to non-1st-degree contacts or to group members

Only a handful of Sales Navigator partners get messaging access, and that program is closed to most developers. Anything that scrapes the LinkedIn UI (Chrome extensions, headless browsers logged in as the user) violates LinkedIn's TOS and gets accounts banned.

So this plan ships LinkedIn **assist**, not automation:
- AI agent helps the user **decide** who to target (niche → suggested groups/orgs to search manually on LinkedIn, suggested comment angles, suggested DM openers).
- One-click "open this LinkedIn search" / "open this group" deep links.
- AI-drafted comment + DM templates, copy-to-clipboard, logged as outreach activity.
- The actual posting/messaging happens in the user's LinkedIn tab — we never automate it.

If you want true automation, that requires a separate browser-extension product on a different roadmap; flag it now and we'll skip that here.

## Pricing tiers (weekly, reset every week, no rollover)

| Tier    | Price    | Emails / week | LinkedIn assist actions / week |
|---------|----------|---------------|-------------------------------|
| Starter | $19/wk   | 500           | 50                            |
| Growth  | $39/wk   | 1,500         | 150                           |
| Power   | $79/wk   | 4,000         | 400                           |

Volume-only differentiation — every feature (campaign wizard, fast mode, reply handler, LinkedIn assist, analytics) is available on all tiers. The LinkedIn cap counts AI-drafted comments + DM templates generated per week.

Cancellation: access continues until the current week ends, then stops.

## Scope

### 1. Stripe products (test env, auto-syncs to live)
- Archive old one-time packs (`emails_10`, `emails_25`, `emails_50`, `emails_100`).
- Create 3 new recurring weekly prices: `starter_weekly` ($19), `growth_weekly` ($39), `power_weekly` ($79).
- Tax code `txcd_10103001` (SaaS).
- Use `managed_payments: { enabled: true }` on checkout (Stripe handles tax/fraud/disputes for ~80 buyer countries, +3.5% per transaction, bank descriptor shows `LINK.COM*`).

### 2. Database
- New `subscriptions` table per webhook spec (user_id, stripe_subscription_id, price_id, status, current_period_end, cancel_at_period_end, environment).
- New `weekly_usage` table: `user_id, week_start (date), emails_sent, linkedin_actions` — resets via week_start key.
- Helper SQL function `current_week_caps(user_id)` returns `{ email_cap, linkedin_cap, emails_used, linkedin_used }` based on active subscription's `price_id`.
- Keep `user_credits` table for legacy 50 free welcome emails until consumed, then everything is subscription-driven.

### 3. Edge functions
- `payments-webhook`: handle `customer.subscription.{created,updated,deleted}` per spec.
- `create-checkout`: embedded mode, recurring price, `subscription_data.metadata.userId`, `resolveOrCreateCustomer`.
- `create-portal-session`: for cancel / change plan / update card.
- `send-campaign-emails`: before sending each batch, check `current_week_caps`; halt with friendly "You've hit your weekly Starter limit — upgrade to keep sending" message.
- `linkedin-assist`: new function. Takes niche + lead context, returns suggested groups (as LinkedIn search URLs), 3 comment drafts, 3 DM drafts. Increments `linkedin_actions` counter.

### 4. Frontend
- New `/pricing` page with 3 tier cards, "Subscribe weekly" CTA opening embedded Stripe checkout.
- Replace existing "Buy emails" / top-up UI with "Manage subscription" (opens Stripe portal).
- Dashboard header strip: "X / 500 emails this week · resets Sunday" with progress bar; same for LinkedIn assist actions.
- New "LinkedIn Assist" tab in campaign view: input niche → AI agent suggests groups + drafts. Copy buttons + "Open in LinkedIn" deep links. Clear disclaimer: "We never log into LinkedIn for you — posting/messaging happens in your browser."
- Welcome modal updated: 50 free welcome emails on signup, then choose a plan.

### 5. Memory updates
- Rewrite `mem://features/pricing` to weekly subscription model.
- Update `mem://features/social-outreach` to describe LinkedIn assist and its limits.
- Add `mem://features/usage-caps` describing weekly reset.

## What is explicitly NOT in scope
- Automated LinkedIn commenting/messaging (TOS + API limits).
- Group member scraping.
- Browser-extension companion.
- Annual / monthly plans (weekly only as you asked).
- Rollover credits.

## Open before build
None — ready to implement once you approve.
