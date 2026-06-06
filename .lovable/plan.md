# A2A Marketplace — Real Hire Flow (MVP)

Goal: external agents can `POST /v1/agents/{agent_id}/hire` and trigger a real campaign in our existing outreach engine. Human "Start Campaign" buttons use the same path.

## Timeline (working MVP)

- **Day 1 (today):** Endpoints live + auth + agent registry + hire creates campaign. Returns `job_id`. Mock job status.
- **Day 2:** Wire hired campaigns into existing email engine (reuse `start-campaign` / send pipeline). Callback webhooks on `lead_found`, `email_sent`, `reply_received`.
- **Day 3:** Per-result billing ledger + spending caps + dashboard "Hired via A2A" filter + pause/resume.
- **Day 4:** Polish, rate limits, API key dashboard for partner agents, docs page refresh to match real endpoints.

## What I'll build now (this turn = Day 1)

### 1. Database (one migration)
- `a2a_api_keys` — partner agent API keys (hashed), owner email, status, rate limit tier, created_at.
- `a2a_agents` — public agent registry: `agent_id` (slug), name, description, niche, persona, pricing_per_lead_cents, pricing_per_reply_cents, capabilities jsonb, active.
- `a2a_jobs` — `job_id`, api_key_id, agent_id, campaign_id (fk → campaigns), status (`queued|running|paused|completed|failed`), callback_url, sender_identity jsonb, request jsonb, results_summary jsonb, spend_cents, spending_cap_cents, created_at, updated_at.
- `a2a_ledger` — append-only billing events: job_id, event_type (`lead`,`email_sent`,`reply`,`meeting`), unit_cost_cents, metadata, created_at.
- Seed `a2a_agents` from the 6 marketplace cards.
- RLS: all locked to `service_role`. Public-readable view `a2a_agents_public` for the GET listing (or open SELECT on `a2a_agents WHERE active`).

### 2. Edge functions (public, `verify_jwt = false`, Bearer API key auth via header)
- `a2a-agents-list` — GET filters by niche, capability.
- `a2a-agent-get` — GET full Agent Card (A2A spec shape).
- `a2a-agent-hire` — POST. Validates key, creates `campaigns` row owned by the API key's system user, creates `a2a_jobs` row, enqueues first run, returns `{ job_id, status:"queued", estimated_cost_cents }`.
- `a2a-job-get` — GET status + results summary.
- `a2a-callback-emit` (internal helper, not exposed): POSTs signed payloads to `callback_url` on events.

All four use a shared `_shared/a2a.ts` for key hashing + lookup + rate limiting + HMAC signing of callbacks.

### 3. Frontend wiring (minimal today)
- `MarketplaceSections.tsx` "Start Campaign" already calls the wizard — additionally, when user confirms, call `a2a-agent-hire` server-side via the existing campaign creation path so both flows produce an `a2a_jobs` row with `source="human"`.
- Dashboard: add a "Source" badge (Hired via A2A / Manual) on campaign rows. Filter chip.
- `/for-agents` page: update example curl to real URLs and add a "Request API key" mailto for now (self-serve key UI = Day 4).

### 4. Compliance / safety (enforced in `a2a-agent-hire` + send loop)
- Per-job `spending_cap_cents` (default $25, max from request).
- Daily send cap per job (reuse existing tier caps via `current_week_caps`).
- LinkedIn = assist-only flag forced true; reject `capability:"linkedin_auto"`.
- Mandatory unsubscribe (already in send pipeline).

## Out of scope (later phases)
- Self-serve API key issuance UI (Day 4).
- Stripe metered billing for A2A (Day 3 — ledger first, invoice later).
- Real-time websockets for partners (poll-only for MVP).
- Meeting booking attribution.

## Credentials needed from you
**None to start.** I'll use existing Lovable AI Gateway + Lovable Cloud. To begin actually charging partner agents on Day 3 you'll need Stripe live (already in progress).

For callback delivery I'll sign payloads with a project secret — I'll generate `A2A_CALLBACK_SIGNING_SECRET` automatically.

## Technical notes
- API base: `https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/` mapped to `/v1/agents/...` via friendly URLs in the docs (we document the function URL directly; later we can put a custom domain rewrite).
- Agent Card follows A2A spec subset: `{ agent_id, name, description, capabilities[], pricing{}, endpoints{}, owner, version }`.
- Hire response shape matches your spec exactly: `{ job_id, status, estimated_cost_cents, currency:"usd" }`.

Approve and I'll ship Day 1 in this turn.
