# Day 2 — A2A Engine Integration

Goal: a `POST /v1/agents/{id}/hire` call results in real leads scraped, real emails sent through the existing pipeline, and partner agents receive signed webhook callbacks on every event.

## What ships this turn

### 1. Hire → real campaign kickoff
Update `a2a-agent-hire` so after creating the `campaigns` + `a2a_jobs` rows it:
- Calls `firecrawl-search` (or `firecrawl-scrape` when a URL is given) using the agent's preset niche/persona to find leads.
- Calls `extract-leads` to normalize.
- Calls `generate-emails` with the agent's persona + `sender_identity` from the hire request.
- Persists leads + emails onto the campaign row.
- Flips `a2a_jobs.status` → `running`, fires `lead_found` callback batch.
- Enqueues the first send batch via new internal function `a2a-run-job` (see #2).

All of this runs inside the hire request with `EdgeRuntime.waitUntil(...)` so the partner gets `{ job_id, status:"queued" }` back in <2s while work continues in the background.

### 2. New edge function `a2a-run-job` (internal, service-role only)
Single worker that:
- Loads job + campaign + sender SMTP identity (system sender for A2A jobs; see #3).
- Enforces `spending_cap_cents` and per-job daily send cap (reuse `current_week_caps` shape, plus job-local counter).
- Sends one batch (15) via the same SMTP path as `send-campaign-emails` — extracted into `_shared/send-batch.ts` so both functions share code without duplication.
- On each successful send: insert `a2a_ledger` row (`event_type='email_sent'`, `unit_cost_cents=agent.pricing_per_lead_cents`), bump `a2a_jobs.spend_cents`, fire `email_sent` callback.
- Self-reschedules via `pg_cron` "every minute" job that picks up any `a2a_jobs` in status `running` with remaining leads, until done → status `completed` + `job_completed` callback.

### 3. Sender identity for A2A jobs
Partner agents won't have SMTP. Two modes accepted in the hire body:
- `sender_identity.mode = "managed"` (default): send from the platform's shared transactional domain via Lovable email infra (`send-transactional-email`). Requires email domain — will trigger the email setup dialog if not configured.
- `sender_identity.mode = "byo_smtp"`: partner provides `{ host, port, username, password, from }` encrypted and stored on the job row only (never written back to `user_email_settings`).

For Day 2, ship `managed` mode end-to-end. `byo_smtp` accepted but stubbed → 501.

### 4. Callbacks (signed, retried)
Events: `job_queued`, `leads_found`, `email_sent`, `email_opened`, `email_clicked`, `reply_received`, `job_paused`, `job_completed`, `job_failed`.
- Reuse `signPayload` in `_shared/a2a.ts`.
- Single retry on non-2xx after 30s (best effort; no DLQ this phase).
- `track` function already fires open/click DB updates — add a trigger-free path: when `campaign_sends.opened_at`/`clicked_at` is set and that send belongs to a campaign with an `a2a_jobs` row, the `track` function additionally calls `emitCallback`. (Lookup by `campaign_id → a2a_jobs`.)

### 5. Pause / resume
- Add `POST /v1/jobs/{id}/pause` and `/resume` → `a2a-job-control` function. Auth: same API key as hire, or owning user JWT.
- Sets `a2a_jobs.status = paused|running`; `a2a-run-job` skips paused jobs. `send-campaign-emails` already respects `campaigns.status='paused'`, so we also mirror status to the campaign row.

### 6. Dashboard surfacing
- `src/pages/Index.tsx` campaign list already shows "Hired via A2A" badge. Add `Pause`/`Resume` buttons next to A2A jobs that call the new control endpoint.
- New `src/components/dashboard/A2AJobMeter.tsx`: shows spend / cap progress bar + live status pill (queued/running/paused/completed). Polls `a2a-job-get` every 10s while running.

### 7. Compliance guards (enforced in `a2a-agent-hire`)
- Reject `capabilities` containing `linkedin_auto` → 400.
- Cap `spending_cap_cents` at $500/job for Day 2.
- Force `unsubscribe_footer = true`.
- Daily send cap per job: 100 emails (configurable later).

## Files

New:
- `supabase/functions/_shared/send-batch.ts` — shared SMTP send + tracking injection + ledger hook.
- `supabase/functions/a2a-run-job/index.ts`
- `supabase/functions/a2a-job-control/index.ts`
- `src/components/dashboard/A2AJobMeter.tsx`

Edited:
- `supabase/functions/a2a-agent-hire/index.ts` — orchestrate scrape → leads → emails → kickoff.
- `supabase/functions/a2a-job-get/index.ts` — return spend, cap, last event.
- `supabase/functions/send-campaign-emails/index.ts` — refactor to use `_shared/send-batch.ts` (behavior unchanged).
- `supabase/functions/track/index.ts` — emit A2A callbacks on open/click when job exists.
- `src/pages/Index.tsx` — pause/resume buttons + A2AJobMeter for A2A jobs.

## Database (one migration)
- `a2a_jobs`: add `leads_total int`, `leads_sent int`, `daily_send_cap int default 100`, `last_event text`, `last_event_at timestamptz`, `paused_at timestamptz`.
- New table `a2a_byo_smtp` (job-scoped, service_role only) — created but unused this phase.
- `pg_cron` job `a2a-run-job-tick` every minute → POSTs to `a2a-run-job` with service role header. Created via `supabase--insert` (not migration) because it contains the function URL + anon key.

## Out of scope (Day 3+)
- BYO SMTP execution.
- Stripe metered invoicing of `a2a_ledger`.
- Self-serve API key issuance UI.
- Reply classification → `reply_received` callback (reply IMAP polling exists but not yet wired to A2A jobs; will add Day 3).

## Credentials needed
None. Reuses Firecrawl, Lovable AI Gateway, existing SMTP. `A2A_CALLBACK_SIGNING_SECRET` already auto-set.

## Test plan (after build)
1. `curl POST /v1/agents/saas-prospector/hire` with a fake callback URL (webhook.site) → expect `job_id` in <2s.
2. Poll `/v1/jobs/{id}` → status moves `queued → running → completed`.
3. webhook.site shows signed `leads_found`, `email_sent` (×N), `job_completed` events.
4. Dashboard shows the job with live spend meter and a working Pause button.

Approve and I ship.