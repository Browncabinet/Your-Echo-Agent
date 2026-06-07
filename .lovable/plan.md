# End-to-End A2A Billing Test Plan

Goal: prove the full prepaid-balance loop works against your live Stripe **sandbox** — top-up → balance credited → job runs → ledger billed → balance drawn down → insufficient-funds pauses job.

## Prerequisites to verify first
1. Stripe sandbox products `a2a_credit_25_once` / `a2a_credit_100_once` / `a2a_credit_500_once` exist (create via `payments--batch_create_product` + `create_price` if missing — tax code `txcd_10103001`, one-time).
2. `payments-webhook` is registered for sandbox (already auto-registered).
3. At least one `a2a_api_keys` row exists for your user, and one published agent in `a2a_agents`.

## Test steps

### 1. Provision partner row
- Curl `a2a-agent-hire` with your sandbox API key + a tiny `lead_count` (e.g. 2) to ensure an `a2a_partners` row is created.
- SQL check: `select * from a2a_partners where api_key_id = '<key>'` → balance = 0.

### 2. Top up $25 via embedded checkout
- Open `/for-agents/billing` in preview, click **$25**, pay with `4242 4242 4242 4242` / future expiry / any CVC.
- Watch `payments-webhook` edge logs for `checkout.session.completed` + `A2A partner credited <id> 2500`.
- SQL check: `balance_cents = 2500`.

### 3. Run a billable job
- Trigger `a2a-run-job` for the hire from step 1 (small batch, 2 leads).
- After send, `a2a-billing-charge` should debit per `unit_cost_cents` from ledger rows.
- Verify in logs: `{ ok: true, charged_cents: N, items: 2 }`.
- SQL check: `a2a_ledger.billed = true, billing_method='prepaid_balance'`; `a2a_partners.balance_cents = 2500 - N`; `total_spent_cents = N`.

### 4. Force insufficient funds
- Manually set `balance_cents = 1` via SQL.
- Trigger another send batch.
- Expect: job `status='paused'`, `last_event='billing.insufficient_funds'`, callback fired (if `callback_url` set), response `{ ok:false, paused:true }`.

### 5. Recover via top-up
- Top up $25 again from `/for-agents/billing`.
- Manually re-`resume` job via `a2a-job-control` and confirm next batch charges cleanly.

## What I'll use
- `supabase--curl_edge_functions` to drive `a2a-agent-hire`, `a2a-run-job`, `a2a-billing-charge`, `a2a-job-control`.
- `supabase--read_query` for SQL assertions after each step.
- `supabase--edge_function_logs` to confirm webhook + charge logs.
- Manual: you complete the Stripe checkout in preview (I can't type card numbers into the iframe).

## What I need from you
1. Confirm I can use **your logged-in preview session** for the checkout step (you'll click pay with the test card).
2. Confirm an existing `a2a_api_keys` row + agent_id I should hire — or say "create fresh" and I'll bootstrap one.
3. Approve creating the three Stripe credit products if they don't exist yet.

Approve and I'll execute steps 1, 3, 4, 5 (everything except the manual card entry in step 2) and report results after each.