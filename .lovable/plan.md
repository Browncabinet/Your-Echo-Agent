
# Site-wide bug fix pass

Three parallel audits (frontend pages, edge functions, live route smoke-test) found the issues below. I've cross-checked and dropped false positives (e.g. "missing" partner routes actually live at `/for-agents/login|signup|discover`).

## Critical — security & broken auth

1. **`create-checkout` subscription forgery** (`supabase/functions/create-checkout/index.ts:42`) — `userId` is read from the request body with no auth, then written into Stripe metadata. Anyone can POST a victim's UUID and receive Pro access on that account after paying (or via a replayed webhook). Fix: require the caller's JWT, resolve `userId` from `auth.getUser(token)`, ignore any body-supplied `userId`.

2. **Four functions crash on every call** — `check-replies`, `send-campaign-emails`, `linkedin-assist`, `discover-communities` all call `supabase.auth.getClaims(token)`, which doesn't exist in `@supabase/supabase-js` v2 → always 500. Replace with `supabase.auth.getUser(token)`.

3. **A2A external partners get 401 at the gateway.** `supabase/config.toml` doesn't set `verify_jwt = false` for the public/API-key A2A functions. Add `verify_jwt = false` for: `a2a-agent-get`, `a2a-agents-list`, `a2a-agent-hire`, `a2a-job-get`, `a2a-job-control`, `a2a-job-rate`, `a2a-openapi`, `well-known-agent`, `a2a-run-job`, `a2a-callback-retry`, `mcp-http`, `pr-outreach-create-job`, `unsubscribe`.

4. **`/admin/dashboard` is publicly reachable** and renders the A2A simulator (`src/App.tsx:77`). Wrap in `ProtectedRoute` (and ideally an admin role check) or delete the alias — `/dev/a2a-sim` already exists.

5. **XSS in A2A simulator** (`src/pages/A2ASimulator.tsx:208`) — `dangerouslySetInnerHTML` receives raw HTML from the `charts-render` edge function. Sanitize with DOMPurify before rendering.

6. **Open redirect on tracking endpoint** (`supabase/functions/track/index.ts:88`) — `?url=` is followed with no allowlist. Validate that `redirect` is one of the campaign's known outbound domains, or at least an absolute URL whose host matches a persisted `campaign_sends.allowed_hosts` entry.

7. **`a2a-callback-retry` has zero auth** (`supabase/functions/a2a-callback-retry/index.ts:86`) — anyone can trigger the retry sweep. Require service-role bearer.

8. **`a2a-run-job` accepts the public anon key** (`supabase/functions/a2a-run-job/index.ts:372`). The anon key ships in every browser bundle. Drop the `isAnon` branch; the cron worker already uses service-role.

9. **Payments webhook double-credit race** (`supabase/functions/payments-webhook/index.ts:190-208`) — read/increment/write on `user_credits.balance` with no idempotency key on the ledger row. Move to an atomic RPC that upserts a `credit_ledger` row keyed by `stripe_event_id` and applies the delta in a single statement.

10. **PartnerDashboard leaks callbacks across tenants** (`src/pages/PartnerDashboard.tsx:77`) — `a2a_callbacks_log` query has no `.eq()`. Move it inside the `if (p?.id)` block and filter `.eq("partner_id", p.id)`.

11. **`send-reply` service-role update misses ownership check** (`supabase/functions/send-reply/index.ts:156`) — add `.eq("user_id", userId)` on the update.

## High — reliability, cost, correctness

12. **Unauthenticated paid-API drains** — `extract-leads`, `firecrawl-scrape`, `firecrawl-search`, `generate-emails`, `extract-selling-points`, `campaign-summary` accept any JWT with no per-user rate limit. Add an authenticated-user check plus a per-user daily cap (reuse `weekly_usage`).

13. **`a2a-agent-hire` duplicate-user bug** (`supabase/functions/a2a-agent-hire/index.ts:117`) — `listUsers()` returns only 50 rows; users beyond that get a fresh auth account on every hire. Replace with `supabase.auth.admin.getUserByEmail`-style lookup via the `profiles` table (or paginate).

14. **`a2a-agent-hire` spend cap bypass** (`:98`) — `pricing_per_lead_cents` from the DB is unclamped; a rogue agent can set it huge to push `Math.max(estimatedCost, cap)` past the 100k cap. Clamp `pricing_per_lead_cents` at read time (e.g. `Math.min(500, ...)`).

15. **Un-awaited `emitCallback`** in `a2a-billing-charge/index.ts:54` and `a2a-job-control/index.ts:54,75` — isolate teardown drops the callback writes. Add `await`.

16. **`track-event` missing CORS** — every response lacks `Access-Control-Allow-*`. Add the shared `corsHeaders` and OPTIONS handler.

## Medium — UX bugs

17. **Discover cap always reads 0** (`src/pages/Discover.tsx:135`) — reads `discoveries_cap` / `discoveries_used` from `WeeklyCaps`, but those keys don't exist. Wire to the real cap fields (or add them to `current_week_caps`).

18. **Silent Supabase errors** in `PartnerDashboard.tsx:70-95`, `PartnerBilling.tsx:71-84`, `MyRadar.tsx:25-33` — capture `error` and surface via toast + empty-state message.

19. **`get-stripe-price` returns 500 with stack trace** — wrap `req.json()` in try/catch, return 400 on parse failure.

20. **`pr-outreach-draft` / `pr-outreach-create-job` leak raw error messages** in 500 responses. Return a generic message and log the detail server-side.

21. **Redirect polish** — `ProtectedRoute` sends to `/auth` (which is fine, `/auth` is a real route), but `CheckoutReturn.tsx:43` and `Auth.tsx:337` both `navigate("/")`, causing a double-hop through `HomeRoute`. Send them directly to `/for-agents/dashboard`.

## Out of scope for this pass

- Dark-mode token mismatches inside `PartnerShell` (cosmetic).
- Low-contrast `text-slate-500` in `Auth.tsx` LiveTerminal (cosmetic).

## Technical notes

- Order of edits: `config.toml` first (unblocks all A2A callers), then the four `getClaims` fixes (unblocks reply/send/discover flows), then `create-checkout` auth, then the rest.
- After changes, verify with:
  - `curl` the affected edge functions via the `supabase--curl_edge_functions` tool (unauth + auth cases).
  - Re-run the Playwright smoke on `/for-agents/dashboard`, `/for-agents/billing`, `/for-agents/discover` while logged in.
  - `supabase--linter` for any migration-adjacent changes.
- No DB schema changes required except optionally a `credit_ledger(stripe_event_id unique)` table for the webhook idempotency fix (step 9). Confirm before I add that migration.

## What I will NOT change

- Route table itself (Playwright's "missing" routes actually exist under `/for-agents/*`).
- MCP server / Glama / npm publish work.
- Design system, brand copy, or pricing.
