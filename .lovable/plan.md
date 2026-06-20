## Goal

Smithery requires a live HTTPS MCP server speaking Streamable HTTP transport. Currently `mcp-server/` is stdio-only (Claude Desktop / Cursor via `npx`). I'll add an HTTP-transport twin hosted as a Lovable Cloud Edge Function, keeping the existing stdio package untouched so Glama / Claude Desktop continue working.

## What to build

### 1. New edge function: `supabase/functions/mcp-http/index.ts`
- Use `mcp-lite` (`npm:mcp-lite@^0.10.0`) + Hono for Streamable HTTP transport (the pattern Smithery requires).
- Re-implement the same 6 tools as the stdio server, calling the existing `a2a-*` edge functions internally:
  - `list_available_agents` → `a2a-agents-list`
  - `get_agent_card` → `a2a-agent-get`
  - `hire_echo_agent` → `a2a-agent-hire`
  - `get_job_status` → `a2a-job-get`
  - `control_job` → `a2a-job-control`
  - `rate_job` → `a2a-job-rate`
- Auth model: Smithery passes per-user config (the `ECHO_API_KEY`) as query params or headers. Read `ECHO_API_KEY` from `?apiKey=...` query string OR `x-echo-api-key` header (Smithery's config-injection pattern), then forward as `Authorization: Bearer eak_...` to the internal A2A functions.
- CORS + OPTIONS handling per Lovable edge-function rules.
- Public function (no JWT) so Smithery's scanner can reach it.

### 2. Static server card: `public/.well-known/mcp/server-card.json`
- Lets Smithery's scanner enumerate tools/metadata even before a real API key is supplied (since most tools require auth).
- Lists name, description, 6 tools, required config field `ECHO_API_KEY`.

### 3. Smithery config: `smithery.yaml` at repo root
- Declares: runtime `remote`, URL = `https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http`, transport `streamable-http`, config schema requiring `echoApiKey` (mapped to header `x-echo-api-key`).

### 4. Docs updates
- `docs/registry-submissions.md`: rewrite the Smithery section — submit the hosted URL `https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http`, not the GitHub repo.
- `mcp-server/README.md`: add a "Hosted (Smithery / remote MCP)" section pointing at the same URL, alongside the existing stdio install snippets.

## What stays the same
- `mcp-server/` npm package — still stdio, still on npm, still works in Claude Desktop / Cursor / Windsurf.
- `glama.json` — Glama listing unchanged (it already accepts stdio).
- Existing A2A edge functions — no changes; the new function is a thin MCP adapter.

## Submission flow after build
1. Edge function deploys automatically.
2. Verify with `curl -X POST https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http` returns valid MCP `initialize` response.
3. Go to <https://smithery.ai/new>, paste the hosted URL, complete publishing flow.

## Out of scope
- OAuth for Smithery (using simple API-key-in-config instead — same pattern as most listed MCP servers).
- Migrating the stdio package to HTTP.
