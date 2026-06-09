# Phase 1 — P0 Hotfix (stop the bleeding)

Goal: nothing in the product is broken, fake, or forgeable.

## 1.1 Fix broken `publicBaseUrl` import
- `supabase/functions/_shared/a2a.ts`: add and export `publicBaseUrl(req)` helper (derives from `req.url` origin, falls back to `https://yourechoagent.com`).
- Used by `a2a-agents-list`, `a2a-agent-get` — currently throws at runtime.

## 1.2 Remove "MCP compatible" marketing until real
- Strip "MCP" claim from: `public/llms.txt`, `src/pages/ForAgents.tsx`, `src/pages/ForAgentsDocs.tsx`, `src/pages/Index.tsx`, marketplace sections, hero copy.
- Replace with "A2A-native" only. MCP returns in Phase 3.

## 1.3 Idempotency on `a2a-agent-hire`
- Accept `Idempotency-Key` header.
- New table `a2a_idempotency_keys (key, api_key_id, response_json, created_at)` with unique `(api_key_id, key)`.
- On replay within 24h return the stored response; never create a second job.

## 1.4 Harden callback signing secret
- Remove `"dev-secret-change-me"` fallback in `signPayload`. Throw if `A2A_CALLBACK_SIGNING_SECRET` is unset.
- Secret already added by user.

## 1.5 Schema version alignment
- Decide on `"0.3.0"` (current A2A spec). Update `toAgentCard` + docs + ForAgentsDocs page to match. Remove `"a2a/1.0"` references.

## 1.6 Cancel endpoint
- Extend `a2a-job-control` to accept `/cancel` (terminal state, no resume). Update `A2AJobMeter` with Cancel button + confirm dialog.

## 1.7 Wire `auto_charge` or remove it
- Decision: **remove** the dead column from `a2a_jobs` (migration) and remove all references. Insufficient-funds → pause is the documented behavior. Re-introduce only when Stripe auto-top-up exists (Phase 3).

## 1.8 Honest copy pass
- Replace "Trusted by Claw, Hermes…" or any unverified partner names with truthful "Built for A2A agents like Claw and Hermes" framing.
- Ratings: hide the hardcoded `5.0` until real ratings exist (show "New" badge instead).

---

## Files touched
```text
supabase/functions/_shared/a2a.ts                    (publicBaseUrl, signPayload hardening)
supabase/functions/a2a-agent-hire/index.ts           (idempotency)
supabase/functions/a2a-job-control/index.ts          (cancel)
supabase/migrations/20260609_a2a_p0_hotfix.sql     (a2a_idempotency_keys, drop a2a_jobs.auto_charge)
public/llms.txt                                       (remove MCP claims)
src/pages/ForAgents.tsx                               (honest copy)
src/pages/ForAgentsDocs.tsx                           (honest copy, schema version)
src/pages/Index.tsx                                   (honest copy)
src/components/dashboard/A2AJobMeter.tsx            (cancel button)
```

## Acceptance
- All 7 P0s closed, no fake claims in copy, idempotent hire endpoint, signed callbacks cannot be forged.