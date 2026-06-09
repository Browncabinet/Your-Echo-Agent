# A2A Re-Positioning Sprint — P0 Hotfix + Full Marketplace Credibility

Three-phase sprint that ships in order. Each phase is independently deployable so you can stop after Phase 1 if needed and still have a non-fraudulent product.

---

## Phase 1 — P0 Hotfix (stop the bleeding)

Goal: nothing in the product is broken, fake, or forgeable.

### 1.1 Fix broken `publicBaseUrl` import
- `supabase/functions/_shared/a2a.ts`: add and export `publicBaseUrl(req)` helper (derives from `req.url` origin, falls back to `https://yourechoagent.com`).
- Used by `a2a-agents-list`, `a2a-agent-get` — currently throws at runtime.

### 1.2 Remove "MCP compatible" marketing until real
- Strip "MCP" claim from: `public/llms.txt`, `src/pages/ForAgents.tsx`, `src/pages/ForAgentsDocs.tsx`, `src/pages/Index.tsx`, marketplace sections, hero copy.
- Replace with "A2A-native" only. MCP returns in Phase 3.

### 1.3 Idempotency on `a2a-agent-hire`
- Accept `Idempotency-Key` header.
- New table `a2a_idempotency_keys (key, api_key_id, response_json, created_at)` with unique `(api_key_id, key)`.
- On replay within 24h return the stored response; never create a second job.

### 1.4 Harden callback signing secret
- Remove `"dev-secret-change-me"` fallback in `signPayload`. Throw if `A2A_CALLBACK_SIGNING_SECRET` is unset.
- Add secret via `add_secret` if not present.

### 1.5 Schema version alignment
- Decide on `"0.3.0"` (current A2A spec). Update `toAgentCard` + docs + ForAgentsDocs page to match. Remove `"a2a/1.0"` references.

### 1.6 Cancel endpoint
- Extend `a2a-job-control` to accept `/cancel` (terminal state, no resume). Update `A2AJobMeter` with Cancel button + confirm dialog.

### 1.7 Wire `auto_charge` or remove it
- Decision: **remove** the dead column from `a2a_jobs` (migration) and remove all references. Insufficient-funds → pause is the documented behavior. Re-introduce only when Stripe auto-top-up exists (Phase 3).

### 1.8 Honest copy pass
- Replace "Trusted by Claw, Hermes…" or any unverified partner names with truthful "Built for A2A agents like Claw and Hermes" framing.
- Ratings: hide the hardcoded `5.0` until real ratings exist (show "New" badge instead).

**Acceptance:** all 7 P0s closed, no fake claims in copy, idempotent hire endpoint, signed callbacks cannot be forged.

---

## Phase 2 — P1 Credibility (be trustable to a partner)

Goal: a partner engineer reading the docs + hitting the API leaves convinced this is real infra.

### 2.1 Discovery — `.well-known/agent.json`
- New public edge function `well-known-agent` serving the A2A discovery manifest at `https://yourechoagent.com/.well-known/agent.json` (via rewrite or function alias). Lists registry URL, agent list URL, auth scheme, callback signing scheme.

### 2.2 Webhook retries + DLQ
- New table `a2a_callback_queue (id, callback_id, attempt, next_attempt_at, status)`.
- `emitCallback` enqueues on non-2xx.
- New scheduled function `a2a-callback-retry` (cron every minute) — exponential backoff 1m/5m/30m/2h/12h, max 5 attempts, then `failed_permanent`.
- Dashboard shows retry status per delivery.

### 2.3 Job event history
- New table `a2a_job_events (id, job_id, event_type, payload, created_at)`.
- Every `emitCallback` also appends here. `a2a-job-get` returns full event timeline. Replace single `last_event` UX with timeline.

### 2.4 SSRF guard on `emitCallback`
- Reject callback URLs resolving to private/loopback/link-local IPs. DNS resolve + check before fetch. Allow override list via env for testing only.

### 2.5 Per-partner webhook secret
- `a2a_partners.webhook_secret` (rotatable). `signPayload` uses partner secret when `partner_id` known, falls back to global secret only for system events.

### 2.6 Real ratings + jobs_completed
- Increment `a2a_agents.jobs_completed` on `job.completed`.
- New `a2a_agent_ratings` table; partner can POST rating after job completion. `rating` becomes computed average; show "New" when n<3.

### 2.7 Two-sided marketplace — Register Your Agent
- Wire the dead button → `/for-agents/register` form (name, description, capabilities, niche, pricing, callback URL, owner email).
- Inserts into `a2a_agents` with `active=false, owner_user_id=auth.uid()`. Admin review queue (simple Postgres flag flip for now).
- Add `owner_user_id` column to `a2a_agents` (migration).

### 2.8 Atomic rate limiting
- Replace two-step counter with `INSERT ... ON CONFLICT DO UPDATE SET count = count + 1 RETURNING count` (single statement, atomic). Eliminates burst bypass.

### 2.9 Error code catalog
- Standardize `{ error: "code", message, hint }`. Document every code in `ForAgentsDocs`. Codes: `unauthorized`, `rate_limit_exceeded`, `agent_not_found`, `insufficient_funds`, `invalid_callback_url`, `idempotency_conflict`, etc.

### 2.10 Docs cleanup
- Pick one base URL, document it everywhere. Add OpenAPI 3.1 spec at `/for-agents/openapi.json`. Embed Swagger viewer on docs page.
- Add bounce suppression note: pre-send check against `bounce_events` (and implement the check in `send-campaign-emails`).

**Acceptance:** external dev can register an agent, get listed after admin approval, hit `.well-known`, integrate against OpenAPI, receive retried signed webhooks, see job timeline.

---

## Phase 3 — Full Re-Positioning (own the A2A category)

Goal: this is the A2A outreach marketplace, not "an app with an API".

### 3.1 Minimal MCP server
- New edge function `mcp-server` using **mcp-lite** (per knowledge file, `mcp-lite@^0.10.0`, Hono + `StreamableHttpTransport`).
- Tools exposed: `list_agents`, `get_agent`, `hire_agent`, `get_job`, `cancel_job`. Auth via same `eak_…` keys in Authorization header.
- Restore "MCP compatible" copy with link to `https://yourechoagent.com/mcp`.
- Add MCP URL to `.well-known/agent.json`.

### 3.2 Artifacts + SSE
- New `a2a_job_artifacts` table (leads CSV, generated emails JSON, reply transcripts). Endpoint `GET /v1/jobs/{id}/artifacts`.
- SSE stream endpoint `GET /v1/jobs/{id}/events` (replays event history then live-tails).

### 3.3 API key scopes + expiry
- Add `scopes text[]` (`agents:read`, `jobs:write`, `agents:register`) and `expires_at` to `a2a_api_keys`. Enforce in `authenticateApiKey`. UI in PartnerDashboard to scope + expire.

### 3.4 Revenue share scaffolding
- `a2a_agents.owner_user_id` (done in 2.7) + new `a2a_payouts` table (agent_owner, period, gross_cents, fee_cents, net_cents, status).
- Nightly cron `a2a-payouts-roll` aggregates completed jobs per owner. Stripe Connect Express onboarding stub on `/for-agents/payouts` (deferred actual payout if Connect not enabled — show "Pending Connect").
- Take rate: 20% platform fee, documented.

### 3.5 Stripe auto-top-up
- `a2a_partners.auto_topup_enabled`, `auto_topup_threshold_cents`, `auto_topup_pack` (25/100/500), saved payment method via Stripe customer.
- `a2a-billing-charge` triggers off-session PaymentIntent when balance dips below threshold; resumes paused jobs on success.
- Reintroduce `auto_charge` semantics at the partner level (not per-job).

### 3.6 Content moderation + sender verification
- `sender_identity.email` must be verified (one-time email loop) before first send. New `a2a_verified_senders` table.
- Pre-send AI moderation pass (Lovable AI Gateway, fast model) flags abusive content; block or queue for review.

### 3.7 Cross-partner unsub suppression
- `unsubscribes` already global; extend pre-send check in `send-campaign-emails` to honor across all partners (it currently scopes per-campaign in places — audit and fix).

### 3.8 Repositioning surface
- New home hero: "The marketplace where AI agents hire outreach agents."
- Replace generic "outreach tool" framing site-wide (Index, About, Pricing, Auth).
- Add "Built on A2A 0.3 + MCP" trust strip with spec links.
- New `/changelog` page (manual MD entries) so partners can track API changes.
- llms.txt updated with MCP endpoint + .well-known link.

**Acceptance:** site reads as A2A marketplace first, app second. External agents listed and earning. MCP works in Claude Desktop / Cursor. Auto-top-up keeps jobs running. Payouts visible to agent owners.

---

## Technical Details

### New tables (migrations, in order)
```text
Phase 1: a2a_idempotency_keys
Phase 2: a2a_callback_queue, a2a_job_events, a2a_agent_ratings
         + alter a2a_agents add owner_user_id, a2a_partners add webhook_secret
Phase 3: a2a_job_artifacts, a2a_payouts, a2a_verified_senders
         + alter a2a_api_keys add scopes/expires_at
         + alter a2a_partners add auto_topup_* columns
```
All tables follow the GRANT + RLS + policy pattern per project rules. service_role for edge functions; authenticated scoped to owner via `a2a_partners.owner_user_id` joins.

### New edge functions
```text
Phase 1: (none — only edits)
Phase 2: well-known-agent, a2a-callback-retry (cron), a2a-job-cancel (or extend a2a-job-control)
Phase 3: mcp-server, a2a-job-events-sse, a2a-job-artifacts, a2a-payouts-roll (cron),
         a2a-stripe-topup, a2a-sender-verify
```

### Files touched (high-confidence list)
```text
supabase/functions/_shared/a2a.ts                       (publicBaseUrl, signPayload, SSRF, atomic RL)
supabase/functions/a2a-agent-hire/index.ts              (idempotency, scopes)
supabase/functions/a2a-job-control/index.ts             (cancel)
supabase/functions/a2a-run-job/index.ts                 (event history, bounce suppression)
supabase/functions/send-campaign-emails/index.ts        (cross-partner unsub, bounce check)
supabase/functions/payments-webhook/index.ts            (auto-topup intents)
src/pages/ForAgents.tsx, ForAgentsDocs.tsx              (copy, register button, OpenAPI link)
src/pages/Index.tsx, Auth.tsx, About.tsx                (repositioning copy)
src/pages/PartnerDashboard.tsx, PartnerBilling.tsx      (scopes UI, auto-topup, payouts)
src/pages/PartnerRegisterAgent.tsx (new)
src/pages/Payouts.tsx (new)
src/components/dashboard/A2AJobMeter.tsx                (cancel button, event timeline)
public/llms.txt                                         (MCP + .well-known)
```

### Secrets to add
```text
A2A_CALLBACK_SIGNING_SECRET (Phase 1, required)
```
Stripe + Lovable AI Gateway secrets already exist.

### Out of scope (explicitly deferred)
- Full Stripe Connect KYC/payout (stub only in 3.4).
- Multi-region webhook delivery.
- Per-tool MCP authentication scopes beyond key-level scopes.

---

## Sequencing & Stopping Points

- **Ship Phase 1 first as one PR.** Product becomes honest and not-broken.
- **Phase 2 in 3 PRs:** (a) discovery + retries + events, (b) registration + ratings + atomic RL, (c) docs + OpenAPI.
- **Phase 3 in 4 PRs:** (a) MCP server, (b) artifacts + SSE + scopes, (c) revenue share + auto-topup, (d) repositioning copy + moderation.

Stop after any phase and the product is still coherent.