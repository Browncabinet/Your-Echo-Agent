
# Site health check & fix pass

Goal: verify every public and authenticated route on yourechoagent.com actually works end-to-end, then fix anything broken. This is a verification-first pass — no speculative rewrites.

## Scope

**Public routes**
`/`, `/pricing`, `/about`, `/privacy`, `/terms`, `/acceptable-use`, `/for-agents`, `/for-agents/signup`, `/for-agents/login`, `/for-agents/docs`, `/auth`

**Authenticated routes** (via injected Supabase session)
`/for-agents/dashboard`, `/for-agents/billing`, `/for-agents/discover`, `/for-agents/radar`, `/for-agents/register`, `/checkout/return`, `/dev/a2a-sim`

**Payments**
- New weekly checkout: `starter_weekly`, `growth_weekly`, `power_weekly`
- One-time packs: `topup_500`, `topup_1000`, `topup_2500`
- Verify each Stripe Price exists with matching `lookup_key` (call `get-stripe-price` for all 6)
- Confirm `create-checkout` returns a `clientSecret` for one weekly + one topup
- Confirm removed keys (`starter_monthly`, etc.) now 400 as expected

**Edge functions — quick health ping**
`create-checkout`, `get-stripe-price`, `create-portal-session`, `payments-webhook` (OPTIONS), `track`, `track-event`, `check-replies`, `send-campaign-emails`, `discover-communities`, `linkedin-assist`, `a2a-agents-list`, `a2a-agent-get`, `well-known-agent`, `a2a-openapi`, `unsubscribe`.

## Method

1. Playwright headless run against `http://localhost:8080` with the injected Supabase session:
   - Load each route, capture screenshot, capture console errors + failed network requests.
   - On `/pricing`: click Starter weekly → assert Stripe embedded checkout iframe mounts.
   - On `/for-agents/dashboard`: assert no red toasts, main widgets render.
   - On `/for-agents/discover`: assert cap displays a real number (regression check on the "always 0" bug).
2. `supabase--curl_edge_functions` for the payments + A2A functions above (unauth + auth cases).
3. `code--read_console_logs` + `code--read_network_requests` snapshot after the Playwright pass.
4. Compile a defect list grouped by severity.

## Fix pass

Only fixes that are (a) reproduced in step 1–3 and (b) small/isolated. For each fix:
- Cite the failing signal (screenshot, curl status, console error).
- Patch the smallest surface area.
- Re-run just that check to confirm green.

Anything larger than a single-file fix, or anything touching schema, gets flagged back to you before I touch it — I will NOT silently expand scope into a redesign or new feature.

## Explicit non-goals

- No design changes.
- No new features.
- No schema migrations.
- No MCP / npm / Glama work.
- No changes to `Pricing.tsx` copy (just verifying it works).

## Deliverable

A short report per route: **PASS** / **FAIL + fix applied** / **FAIL + needs your call**, plus the list of edited files.
