
## Review results

The A2A/MCP discovery surface is healthy — nothing critical is missing:

- `https://yourechoagent.com/.well-known/agent-card.json` → 200, valid A2A 0.3.0 card with 6 skills, pricing, security schemes, contact, ToS/Privacy, OpenAPI ref
- `/.well-known/agent.json`, `/.well-known/ai-plugin.json`, `/.well-known/mcp/server-card.json` → all 200
- `index.html` already advertises the card via `<link rel="agent">` and JSON-LD `SoftwareApplication` entries per sub-agent
- `glama.json` / `server.json` / `smithery.yaml` exist at repo root with correct manifest, tool list, env vars
- Hosted MCP endpoint `supabase/functions/mcp-http` is live and referenced in `smithery.yaml` + `server.json`
- `docs/glama-submission-card.md` has the ready-to-paste Glama form values

## What's actually missing (site → Glama linkage)

The site *mentions* Glama.ai in Home.tsx copy and FAQ, but there is **no clickable link to the Glama listing**, and no "install on Claude/Cursor/Windsurf" quick-copy referencing the published MCP server. For the connection to feel real to visitors and to Glama's crawler (backlinks help ranking), we should:

1. **Add a Glama.ai listing link + badge** in two spots:
   - `src/pages/ForAgents.tsx` — new "Available on" row alongside the existing discovery cards, with Glama.ai badge + link to `https://glama.ai/mcp/servers/@browncabinet/yourechoagent-mcp` (also link to Smithery: `https://smithery.ai/server/@browncabinet/yourechoagent-mcp`).
   - `src/components/Footer.tsx` — small "Listed on Glama · Smithery" links under the For Agents column.
2. **Make the Home.tsx "Glama.ai" mentions clickable** (currently plain text in the FAQ answer and feature card body).
3. **Serve `glama.json` publicly** — currently only at repo root, not at `https://yourechoagent.com/glama.json` (404 confirmed). Copy `glama.json` to `public/glama.json` so Glama's crawler and anyone auditing can fetch it from the site domain.
4. **Add `hostedEndpoint` to `public/.well-known/agent.json`** — the repo `server.json` has it but the public discovery manifest doesn't expose the streamable-http MCP URL (`https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http`). Adding it lets remote MCP clients (and Glama's remote-server variant) discover the hosted transport straight from the site.
5. **Add `mcp` block to `public/.well-known/agent-card.json`** with the same `hostedEndpoint` + `transports: ["streamable-http", "stdio"]` so the A2A card advertises the MCP twin.

## Technical details

Files to change:
- `public/glama.json` — new file, copy of root `glama.json`
- `public/.well-known/agent.json` — add `hostedEndpoint` and `transports` fields matching `server.json`
- `public/.well-known/agent-card.json` — add top-level `mcp: { hostedEndpoint, transports, registryListings: [glama, smithery] }`
- `src/pages/ForAgents.tsx` — add a "Listed on" section with Glama + Smithery badges (SVG or text pill), links open in new tab
- `src/components/Footer.tsx` — add Glama + Smithery links
- `src/pages/Home.tsx` — wrap the two "Glama.ai" strings in `<a>` tags to the listing URL

No backend changes, no schema changes. Purely static/presentation edits.

## Out of scope (mention only)

Publishing the npm package `@browncabinet/yourechoagent-mcp` and pushing the GitHub repo tag are user actions on npm/GitHub — not something I can do from the app codebase. The `docs/glama-submission-card.md` already walks through those steps.
