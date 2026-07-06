## Goal

Keep the MCP server source private (don't publish to npm) and update the "For Agents" setup instructions so AI assistants connect using the direct hosted endpoint instead of npm/registry discovery.

The MCP server is already live at:
`https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http`

## Changes

### 1. Keep source private
- No code change needed in `mcp-server/` — package is unpublished. Leave `publishConfig` alone (harmless while unpublished) and simply don't run `npm publish`.
- Do NOT delete the `mcp-server/` folder — it's still the source of the deployed function.

### 2. `src/pages/ForAgents.tsx`
- Remove the "Listed on MCP registries" section (Glama / Smithery / npm cards, lines ~178–215).
- Replace it with a single **"Connect your assistant"** card that shows the direct MCP endpoint URL with a copy button and short per-client steps:
  - **Claude Desktop / Cursor / Windsurf**: add a `mcpServers` entry pointing to the URL via `streamable-http` transport.
  - **ChatGPT (Developer mode)**: paste the URL as a custom connector.
  - Each block: one sentence + a copy-paste config snippet using the direct URL. No npm, no npx, no registry links.

### 3. `src/components/Footer.tsx`
- Remove the Glama.ai and Smithery links (lines 16 & 18). Leave the rest of the footer intact.

### 4. `src/components/QuickstartSnippets.tsx`
- No changes — snippets already use the direct Supabase functions endpoint.

## Out of scope
- No changes to the MCP server code, tools, deployment, or database.
- No changes to `/for-agents/docs`, `/for-agents/register`, or `.well-known/*` manifests.
