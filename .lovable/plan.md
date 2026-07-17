## Pass 2: enrich MCP tool schemas before Glama re-sync

Goal: lift Glama's per-field / examples / outputSchema sub-scores on top of the title + annotations already deployed.

### File: `supabase/functions/mcp-http/index.ts` (metadata only — no handler changes)

For every tool, edit its `inputSchema` in place to add:

- `description` on **every** property that lacks one (job_id, agent_id, action, stars, feedback, kind, notes, category, location, url, sources, all nested `campaign.*` and `sender_identity.*` and `sender.*` and `groups[]` fields).
- `format: "uri"` on URL fields, `format: "email"` on email fields, `minLength: 1` on required strings.
- `default` values that match handler defaults (`limit: 5`, `tone: "concise"`, `kind: "any"`, `category: "any"`, `sources: 3`).
- `additionalProperties: false` on every object schema.
- Top-level `examples: [ … ]` on each tool with one realistic call (e.g. `discover_events` → `{ niche: "AI agents", kind: "conference", limit: 5 }`, `hire_echo_agent` → full sample payload, `rate_job` → `{ job_id: "job_123", stars: 5, feedback: "Great replies" }`).

Add an `outputSchema` (JSON Schema, `type: "object"`) for the tools whose responses have a stable shape:

- `get_job_status` — `{ job_id, status, progress, leads_count, sent_count, reply_count, spend_cents }`
- `hire_echo_agent` — `{ job_id, status, agent_id, spending_cap_cents }`
- `control_job` — `{ job_id, action, status }`
- `rate_job` — `{ job_id, stars, ok }`
- `add_to_radar` — `{ saved, item, result? }`
- `discover_events` — `{ niche, kind, count, results: [{ title, url, description }] }`
- `discover_communities` — `{ niche, category, location, count, results, next_steps }`
- `build_contact_list` — `{ niche, category, sources_scraped, contact_count, contacts }`
- `list_available_agents` / `get_agent_card` — mirror shape returned by A2A endpoints
- `extract_contacts_from_url` — `{ url, count, contacts }`
- `queue_pr_outreach_job` — `{ job_id, dashboard_url }`

Handlers already emit these shapes via `asText(...)`; the schemas just document them. `asText` returns text content today, which is fine — Glama grades on schema presence, not on structuredContent parity.

### Files: `mcp-server/src/index.ts`, `docs/public-repo-root-files/server.json`, `smithery.yaml`

Skip in this pass — Glama scores the hosted `mcp-http` endpoint (that's what its remote scanner probes). The stdio/npm mirror can catch up in a follow-up if you want npm-listing parity later.

### Verify + ship

1. `bunx tsgo --noEmit` to typecheck.
2. Deploy `mcp-http`.
3. You click Refresh / re-scan on Glama.

### Non-goals
- No handler / auth / routing changes.
- No new tools.
- No changes to the marketing site (no publish needed).

### Expected impact
Adds the last two Glama rubric levers (per-field docs + examples, and outputSchema) on top of the title + annotations already live. Should push discover_communities out of C and the B tools toward A.
