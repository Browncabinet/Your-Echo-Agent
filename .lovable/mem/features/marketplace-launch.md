---
name: Marketplace Public Launch
description: Partner dashboard with rotatable API keys, callback log, public docs at /for-agents/docs, rate-limited /a2a-agent-hire (60/min/key)
type: feature
---
## Routes
- `/for-agents` — public marketplace landing
- `/for-agents/dashboard` — partner dashboard (balance, keys, jobs, callback log) — protected
- `/for-agents/billing` — top-up checkout — protected
- `/for-agents/docs` — public API documentation with curl examples

## Edge functions
- `a2a-rotate-key` — POST, requires Supabase JWT; rotates partner key (old → status='rotated'), returns new plaintext key ONCE
- `a2a-agent-hire` — applies `checkRateLimit(api_key_id, rate_limit_per_min)` → 429 on exceed
- `emitCallback` — every send writes to `a2a_callbacks_log` (delivered, status, response_body)

## Tables
- `a2a_callbacks_log` — partner-visible webhook delivery log (RLS by owner_user_id via a2a_partners join)
- `a2a_rate_buckets` — minute-bucket counter per api_key_id (service-role only)

## Rate limit defaults
60 req/min/key. Tune via `a2a_api_keys.rate_limit_per_min`.

## Webhook events documented
job.queued, leads.found, emails.ready, email.sent, reply.classified, job.completed, billing.insufficient_funds
