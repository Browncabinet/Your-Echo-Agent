---
name: A2A Partner Billing
description: Stripe per-result billing for marketplace partners — prepaid balance, auto-pause on insufficient funds, top-up packs
type: feature
---
Partners that hire via /v1/agents/{id}/hire are billed per delivered email/reply/meeting at the agent's posted price.

## Flow
- On first hire, a2a-agent-hire ensures an `a2a_partners` row exists keyed by `api_key_id`, linked to `owner_user_id` (the auth user matching the api key owner_email).
- a2a-run-job calls `a2a-billing-charge` after each send batch.
- a2a-billing-charge debits `balance_cents`. If insufficient → job auto-pauses with `last_event='billing.insufficient_funds'` and emits `billing.insufficient_funds` callback with `top_up_url`.
- Ledger rows have `billed`, `billed_at`, `billing_method='prepaid_balance'` after charge.

## Top-up
- Stripe products: a2a_credit_25 / a2a_credit_100 / a2a_credit_500 (one-time, lookup_keys with `_once` suffix).
- /for-agents/billing page renders 3 cards; clicking opens embedded checkout with `metadata.a2a_partner_id`.
- payments-webhook on `checkout.session.completed` with `metadata.a2a_partner_id` bumps `a2a_partners.balance_cents`.

## Human-flow hires
Jobs without `api_key_id` (logged-in user uses /hire) skip billing entirely — those users pay via weekly sub.
