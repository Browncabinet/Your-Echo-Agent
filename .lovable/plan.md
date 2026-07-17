## Why the scores are low

Glama grades each MCP tool on the richness of its metadata: human-friendly `title`, MCP `annotations` (readOnly / destructive / idempotent / openWorld), per-property `description`s, `examples`, constraints (`minLength`, `format`, `default`), `additionalProperties: false`, and an `outputSchema` when possible.

Auditing `supabase/functions/mcp-http/index.ts` (the hosted MCP server Glama scans) against the low-scoring tools:

| Tool | Missing today |
|---|---|
| discover_communities (C, 2.6) | no title, no annotations, no examples, no field descriptions on `category`, no `outputSchema` |
| add_to_radar (3.0) | no title/annotations, `kind` undescribed, no examples, mutation not marked |
| control_job (3.2) | no title/annotations, `action` values undescribed, destructive not marked |
| build_contact_list (3.3) | no title/annotations/examples/outputSchema |
| discover_events (3.3) | no title/annotations/examples, `kind` undescribed |
| get_job_status (3.3) | no title/annotations, missing readOnly hint, no example |
| rate_job (3.3) | no title/annotations, `stars` undescribed |
| hire_echo_agent (B) | no title/annotations, nested props undescribed, no example, no outputSchema |

Nothing about the runtime behavior needs to change — only the tool registration metadata.

## Plan

Edit only metadata in `supabase/functions/mcp-http/index.ts`. For each tool listed above (and, for parity, the other tools in the same file):

1. Add `title` — short human name ("Discover Communities", "Hire Echo Agent", "Rate Job", …).
2. Add `annotations`:
   - read-only tools (`list_available_agents`, `get_agent_card`, `get_job_status`, `discover_events`, `discover_communities`, `find_linkedin_groups`, `extract_contacts_from_url`, `build_contact_list`, `draft_outreach_for_event`, `draft_pr_outreach_for_contacts`, `generate_comment_for_community`): `{ readOnlyHint: true, idempotentHint: true, openWorldHint: true }` (openWorldHint false for pure LLM drafts).
   - mutating tools: `hire_echo_agent` → `{ readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true }` (idempotent via Idempotency-Key), `add_to_radar` → same shape, `rate_job` → `{ idempotentHint: true }`, `control_job` → `{ destructiveHint: true, idempotentHint: false }`, `send_pr_outreach_campaign` → `{ destructiveHint: true }`.
3. Enrich `inputSchema`:
   - Add `description` to every property that lacks one (esp. `job_id`, `stars`, `feedback`, `action`, `agent_id`, nested `campaign.*` and `sender_identity.*`, `kind`, `notes`, `category`, `location`).
   - Add `format: "uri"` on url fields, `format: "email"` on emails, `minLength: 1` on required strings.
   - Add `default` values where the handler already defaults (`limit: 5`, `tone: "concise"`, `kind: "any"`, `category: "any"`).
   - Add `additionalProperties: false` on every object.
   - Add `examples: [ … ]` at the tool root with one realistic call.
4. Add `outputSchema` for structured returns where cheap: `get_job_status`, `hire_echo_agent`, `control_job`, `rate_job`, `add_to_radar`, `discover_events`, `discover_communities`, `build_contact_list` (shape: mirror what the handler already puts through `asText`).
5. Mirror the same title/annotations/descriptions into `mcp-server/src/index.ts` (stdio server) so the npm-published package matches, and refresh the tool descriptions in `docs/public-repo-root-files/server.json` and `smithery.yaml` to the same longer copy.

No behavior, auth, routing, or handler logic changes. No new tools. After edits, run `bunx tsc --noEmit` and redeploy `mcp-http` so Glama re-scores against the improved manifest.

### Files touched
- `supabase/functions/mcp-http/index.ts` (metadata only)
- `mcp-server/src/index.ts` (metadata only)
- `docs/public-repo-root-files/server.json`
- `smithery.yaml`

### Expected impact
Glama's rubric rewards each of title / annotations / per-field docs / examples / outputSchema independently, so adding all five typically lifts a B tool to A and a C tool (discover_communities) into the B/A range.
