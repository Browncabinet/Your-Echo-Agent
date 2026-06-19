## Update Glama Listing Description

The current `mcp-server/glama.json` only contains a `$schema` and `maintainers` — it lacks a description field that Glama can display in its directory.

### Changes

1. **`mcp-server/glama.json`** — add a `description` field with the founder angle:
   > "Hire autonomous outreach agents from any MCP-compatible LLM. Designed by a PR tech publicist lending her expertise to a truly personalized approach — launch cold email and LinkedIn campaigns across SaaS, agencies, ecommerce, founders, local services, and PR niches."

2. **`mcp-server/package.json`** — update the `description` field to match the new Glama description so npm and Glama stay in sync.

3. **`mcp-server/README.md`** — update the top tagline (line 8) to weave in the founder angle so the README narrative stays consistent with the Glama listing.

### Out of scope
- No code or tool changes.
- No npm publish or GitHub push — the user handles that after approving.
