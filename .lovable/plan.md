## Current state (already in place)

- `HUNTER_API_KEY` is stored in Lovable Cloud secrets (never in client code).
- Enrichment lives in the `discover-enrich-contact` edge function, gated to authenticated users and scoped to their own `discovered_opportunities` rows (event-based leads only — Discover page).
- Per-contact cache in `contact_enrichments` prevents duplicate spend.
- User pays 1 email-unit per found match; nothing if not found.
- Two-step UX: extract contacts first, "Find emails" on demand (no bulk cold-list enrichment).

## What's missing (the safety asks)

1. **No rate limiting** — a user could hammer the endpoint and burn Hunter quota.
2. **No daily caps** — no ceiling on Hunter lookups per user per day or globally.
3. **Warm-lead gate is implicit** — the function trusts that the opportunity row is event-based; worth an explicit check + block on domains that look like generic cold lists.

## Plan

### 1. Add a `hunter_usage_daily` table
Tracks per-user daily lookup count (calls made, not just charges) so we cap even when Hunter returns "not found" (still consumes provider quota).

```
hunter_usage_daily(user_id uuid, day date, lookups int, PRIMARY KEY(user_id, day))
```
Plus a global counter row (`user_id = '00000000-...'`) for the workspace-wide daily ceiling.

Standard grants + RLS (users read own row, service_role writes).

### 2. Enforce caps + rate limit in `discover-enrich-contact`

Before each Hunter call:
- **Per-user daily cap:** 50 lookups/day (covers a heavy PR session; blocks runaway loops).
- **Global daily cap:** 1,000 lookups/day (protects the shared Hunter plan).
- **Burst limit:** max 10 lookups per user per rolling 60 seconds (in-memory + DB check).
- Increment counter atomically via an upsert RPC (`bump_hunter_usage`).

Return `429` with `{ error: "rate_limited", retry_after }` when tripped; UI shows a friendly toast.

### 3. Tighten warm-lead gating
- Explicit check: opportunity must exist in `discovered_opportunities` for this user (already true) **and** have a non-null `source` in the event-based set (`event`, `podcast`, `pr_request`, `speaking`, `radar`). Reject others with `not_warm_lead`.
- Cap bulk mode at 10 contacts per call (currently 25) — keeps it "warm outreach", not list-building.

### 4. Frontend touch-ups (`src/pages/Discover.tsx`)
- Surface the daily-remaining count next to the balance in the confirm dialog ("You have 47 of 50 daily lookups remaining").
- Handle `rate_limited` and `not_warm_lead` errors with clear toasts.

### 5. Test
- Deploy the migration + function.
- Curl the function with a valid session to confirm: (a) single lookup works, (b) 11th rapid call returns 429, (c) non-event opportunity is rejected.
- Verify a row appears in `hunter_usage_daily` and `contact_enrichments`.
- Report back with the test results.

## Files touched

- **new migration** — `hunter_usage_daily` table + `bump_hunter_usage` RPC + grants/RLS.
- **edit** `supabase/functions/discover-enrich-contact/index.ts` — cap checks, burst limit, warm-lead gate, bulk cap of 10.
- **edit** `src/pages/Discover.tsx` — display daily-remaining, handle new error codes.

## Defaults I'm picking (say the word to change)

| Limit | Value |
|---|---|
| Per-user daily lookups | 50 |
| Global daily lookups | 1,000 |
| Burst | 10 / 60s per user |
| Bulk mode max | 10 contacts/call |
