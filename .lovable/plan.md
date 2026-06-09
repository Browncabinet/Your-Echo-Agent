# Phase 2 — P1 Credibility (be trustable to a partner)

Goal: a partner engineer reading the docs + hitting the API leaves convinced this is real infra. Shipping in 3 sub-PRs you can stop after any one.

---

## PR 2a — Discovery + Reliable Webhooks + Event History

### 2.1 Discovery — `.well-known/agent.json`
- New public edge function `well-known-agent` returning the A2A discovery manifest.
- Rewrite/alias so it serves at `https://yourechoagent.com/.well-known/agent.json`.
- Manifest lists: registry URL, agents list URL, hire URL, auth scheme (`Bearer eak_…`), callback signing scheme (HMAC-SHA256, `X-Echo-Signature`), schemaVersion `0.3.0`.

### 2.2 Webhook retries + DLQ
- New table `a2a_callback_queue (id, callback_id, attempt, next_attempt_at, status, last_error)`.
- `emitCallback` enqueues a retry row on any non-2xx / network failure.
- New scheduled function `a2a-callback-retry` (cron every minute) — exponential backoff 1m / 5m / 30m / 2h / 12h, max 5 attempts, then `failed_permanent`.
- Partner Dashboard shows delivery status + attempt count per callback.

### 2.3 Job event history (timeline)
- New table `a2a_job_events (id, job_id, event_type, payload, created_at)`.
- Every `emitCallback` also appends here. `a2a-job-get` returns full event timeline.
- Replace the single `last_event` UX in `A2AJobMeter` with a scrollable timeline.

### 2.4 SSRF guard on `emitCallback`
- Reject callback URLs that resolve to private / loopback / link-local / metadata IPs (10.0.0.0/8, 172.16/12, 192.168/16, 127/8, 169.254/16, ::1, fc00::/7).
- DNS resolve first, then check. `localhost` and `*.internal` rejected by name too.
- Allow override list via env (`A2A_CALLBACK_ALLOWLIST`) for local testing only.

---

## PR 2b — Two-sided Marketplace + Real Ratings + Atomic RL

### 2.5 Per-partner webhook secret (rotatable)
- `a2a_partners.webhook_secret text` (auto-generated on partner row creation).
- `signPayload` uses partner secret when `partner_id` is known; falls back to global `A2A_CALLBACK_SIGNING_SECRET` only for system events with no partner.
- Add "Rotate webhook secret" button in Partner Dashboard.

### 2.6 Real ratings + jobs_completed
- Increment `a2a_agents.jobs_completed` on `job.completed` (in `a2a-run-job`).
- New table `a2a_agent_ratings (id, agent_id, job_id, partner_id, stars 1–5, comment, created_at)` — unique on `(job_id)` so one rating per job.
- New endpoint `POST /v1/jobs/{id}/rate`.
- `toAgentCard` returns computed average + sample count; show "New" badge when n < 3, hide hardcoded `5.0` star fill.

### 2.7 Register Your Agent (two-sided marketplace)
- Wire the dead button → `/for-agents/register` form (name, description, capabilities, niche, pricing, callback URL, owner email).
- Inserts into `a2a_agents` with `active = false`, `owner_user_id = auth.uid()`.
- Add `owner_user_id` column to `a2a_agents` (migration).
- Owners listed on Agent Card as `owner` field once approved.
- Approval is admin-only for now: simple Postgres flag flip (no admin UI yet — out of scope).

### 2.8 Atomic rate limiting
- Replace the two-step counter in `checkRateLimit` with a single `INSERT … ON CONFLICT DO UPDATE SET count = count + 1 RETURNING count` statement (DB function `a2a_bump_rate(api_key_id, window_start)`).
- Eliminates the burst-bypass race.

---

## PR 2c — Docs, OpenAPI, Error Catalog, Bounce Suppression

### 2.9 Standardized error catalog
- All A2A endpoints return `{ error: "code", message: "human readable", hint?: "what to do" }`.
- Codes: `unauthorized`, `rate_limit_exceeded`, `agent_not_found`, `insufficient_funds`, `invalid_callback_url`, `idempotency_conflict`, `job_not_found`, `job_already_terminal`, `validation_failed`.
- Document each code on the For Agents Docs page.

### 2.10 OpenAPI 3.1 spec + docs cleanup
- Public endpoint `GET /openapi.json` (new edge function `a2a-openapi`) returning the spec.
- `ForAgentsDocs` page: embed a Swagger / Scalar viewer pointing at it.
- Pick one canonical base URL (`https://yourechoagent.com/api`); update all docs + ForAgents page snippets to match.
- Add bounce-suppression note: pre-send check against `bounce_events` (and implement that check in `send-campaign-emails`).

---

## Files touched

```text
supabase/functions/_shared/a2a.ts                  (SSRF guard, per-partner secret, atomic RL call, error helpers)
supabase/functions/a2a-job-get/index.ts            (return event timeline)
supabase/functions/a2a-run-job/index.ts            (append events, bump jobs_completed, bounce suppression hook)
supabase/functions/a2a-agent-hire/index.ts         (validation_failed errors)
supabase/functions/well-known-agent/index.ts       (NEW)
supabase/functions/a2a-callback-retry/index.ts     (NEW, cron-driven)
supabase/functions/a2a-job-rate/index.ts           (NEW)
supabase/functions/a2a-agent-register/index.ts     (NEW)
supabase/functions/a2a-openapi/index.ts            (NEW)
supabase/functions/send-campaign-emails/index.ts   (pre-send bounce check)

supabase/migrations/<ts>_a2a_phase2.sql            (a2a_callback_queue, a2a_job_events,
                                                    a2a_agent_ratings, a2a_partners.webhook_secret,
                                                    a2a_agents.owner_user_id, a2a_bump_rate fn)

src/pages/PartnerRegisterAgent.tsx                  (NEW form)
src/pages/PartnerDashboard.tsx                      (delivery status, rotate webhook secret button)
src/pages/ForAgentsDocs.tsx                         (error catalog, OpenAPI viewer, base URL)
src/components/dashboard/A2AJobMeter.tsx            (event timeline replaces last_event)
src/components/MarketplaceSections.tsx              (wire Register Your Agent button)
src/App.tsx                                         (route /for-agents/register)
public/llms.txt                                     (add .well-known + register URLs)
```

## New tables / columns
```text
a2a_callback_queue   (id, callback_id, attempt, next_attempt_at, status, last_error, created_at)
a2a_job_events       (id, job_id, event_type, payload, created_at)
a2a_agent_ratings    (id, agent_id, job_id UNIQUE, partner_id, stars, comment, created_at)
a2a_partners.webhook_secret  (text, auto-generated)
a2a_agents.owner_user_id     (uuid nullable, references auth.users)
```
All tables follow the GRANT + RLS pattern: `service_role` always, `authenticated` only when partner-scoped via `a2a_partners.owner_user_id`.

## Cron jobs (added via supabase--insert per cron rules)
```text
a2a-callback-retry: every 1 minute
```

## Out of scope (Phase 3)
- MCP server (`mcp-server`), SSE event stream, artifacts endpoint, API key scopes/expiry, revenue share + Stripe Connect, Stripe auto top-up, content moderation, sender verification, repositioning copy pass.

## Acceptance
- External dev can: hit `.well-known/agent.json`, register an agent via `/for-agents/register`, get listed after admin flag flip, integrate against OpenAPI, receive retried signed webhooks (with attempt count), see full job event timeline, rate a completed job, see real averaged ratings on Agent Cards.
- No public Echo endpoint accepts a callback URL that resolves to a private IP.
- Rate limit cannot be bypassed by burst races.
- Every error response uses the documented code catalog.