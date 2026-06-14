# Echo Agent A2A — Gap Review & Plan

Most of this spec already shipped last turn. Below is what's already in place, what's genuinely missing, and one item I need a decision on before touching code.

## Already in place ✅

| Spec item | Status | Location |
|---|---|---|
| `/.well-known/agent.json` static file, A2A v0.3 | ✅ | `public/.well-known/agent.json` (+ `agent-card.json`) |
| Capability tags `data-orchestration`, `visualization-rendering` | ✅ added last turn | manifest `capabilities[]` |
| `echo-pipeline` edge function (text → compressed JSON) | ✅ | `supabase/functions/echo-pipeline/` |
| `charts-render` edge function (JSON → SVG chart + HTML table) | ✅ | `supabase/functions/charts-render/` |
| CORS on both endpoints | ✅ | via `_shared/a2a.ts` `corsHeaders` |
| 10-agent simulator with "Run Network Simulation" button | ✅ | `src/pages/A2ASimulator.tsx` at `/dev/a2a-sim` |
| 10 distinct mock datasets (sales, finance, SEO, support, inventory, ads, leads, churn, deliverability, competitor) | ✅ | same file |
| Ultra-lean (no heavy deps, deterministic compression, 20KB / 500-row caps) | ✅ | both functions |

## Genuine gaps to fill 🟡

1. **`api_schema` field in `agent.json`** — spec asks for it explicitly. Currently we expose `openapi` (A2A v0.3 standard key). I'll add `api_schema` as an alias pointing to the same OpenAPI URL for compatibility.

2. **Terminal-style log output in the simulator** — current UI is a table. I'll replace the right panel with a monospaced, dark, auto-scrolling log that streams lines like:
   ```text
   [12:04:01.221] agent#1 SalesLog Bot      → echo-pipeline  payload=312B
   [12:04:01.298] agent#1 ← 200 ok          77ms             out=184B
   [12:04:01.299] agent#1 → charts-render   payload=96B
   [12:04:01.341] agent#1 ← 200 ok          42ms             rows=3
   ```
   Keep the summary table below it. Adds payload-size tracking (request + response bytes).

3. **`/admin/dashboard` route alias** — add it as an alias for `/dev/a2a-sim` so the spec's URL works. Both routes render the same page.

4. **`/api/*` URL aliases** — spec says `/api/echo-pipeline` and `/api/charts-render`. The real edge function URL is `/functions/v1/echo-pipeline`. I'll add a `vite.config.ts` dev proxy + document the canonical URL in the manifest's `pipelines` block (already added last turn). I will NOT add a server-side rewrite in production because Lovable hosting doesn't proxy `/api/*` to Supabase functions — the manifest already lists the full canonical URLs so external agents work correctly. Recommended approach: document the canonical URL clearly and skip the dev proxy (less moving parts).

## ⚠️ Conflict I need a decision on

**Spec says: "no-auth / open public setting to allow frictionless external agent calling."**

Current implementation: both endpoints require an `eak_` bearer key (with a `?dry=1` bypass used only by the in-app simulator).

If I make these endpoints truly no-auth and public:
- Anyone on the internet can hit them, unmetered.
- `echo-pipeline?mode=ai` would let strangers spend your Lovable AI credits.
- No billing, no per-caller rate limit (only a global one), no abuse trail.
- Conflicts with the existing A2A billing system (`a2a-billing-charge`) and the deliverability/abuse memory rules.

I will **not** silently flip auth off. Three safe options to pick from when you switch to build mode:

- **A. Keep auth as-is** (recommended). Manifest still advertises bearer; spec wording is aspirational but unsafe.
- **B. Open `echo-pipeline` in fast-mode-only (no AI) + open `charts-render`** with a hard global rate limit (e.g. 30 req/min/IP) and disable `?mode=ai` for unauthenticated callers. Lowest risk "open" path.
- **C. Fully open both, no limits.** Not recommended — will leak budget.

## Files that will change (build mode)

- `public/.well-known/agent.json` — add `api_schema` alias field
- `src/pages/A2ASimulator.tsx` — add terminal log panel, track payload bytes
- `src/App.tsx` — add `/admin/dashboard` route alias to the simulator page
- (conditional on your auth choice) `supabase/functions/echo-pipeline/index.ts` + `charts-render/index.ts` — auth changes only if you pick B or C

## Out of scope

- Recharts/Tremor import: spec mentions them as examples but our SVG renderer is lighter and matches goal #4. Will keep current renderer unless you want Recharts.
- Production `/api/*` rewrite: skipping (see gap #4 reasoning).

**Decision needed before build:** pick A, B, or C for the auth question. Default if you don't specify: **A** (keep secure, ship the other three gaps).
