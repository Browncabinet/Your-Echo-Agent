# Optimize A2A Agent Card for Registries

Tighten `public/.well-known/agent-card.json` so it scores well on A2A registries (a2aregistry.org, agents.json directories, MCP/A2A crawlers) and matches the A2A 0.3.0 spec more completely.

## Changes

### 1. Branding consistency
- `name`: change `"Your Echo Agent"` → `"Echo Agent"` (matches `<title>`, OG tags, domain). Keep `provider.organization` as `"Echo Agent"` too.
- `iconUrl`: swap `/favicon.ico` for the hosted PNG/WebP logo already used in JSON-LD (`https://storage.googleapis.com/.../echo_agent_logo.webp`). Registries render this as the card thumbnail; .ico looks broken.

### 2. Richer top-level metadata (A2A 0.3.0 optional fields registries index)
Add:
- `tags`: `["outreach", "cold-email", "lead-generation", "linkedin", "b2b", "marketing", "sales-automation", "marketplace"]`
- `category`: `"marketing-and-sales"`
- `homepage`: `"https://yourechoagent.com"` (some registries read this instead of `provider.url`)
- `termsOfServiceUrl`: `https://yourechoagent.com/terms`
- `privacyPolicyUrl`: `https://yourechoagent.com/privacy`
- `contact`: `{ "email": "hello@yourechoagent.com", "url": "https://yourechoagent.com/for-agents" }`

### 3. `additionalInterfaces` — expose REST alongside JSONRPC
Registries that don't speak JSONRPC will skip the card. Add:
```json
"additionalInterfaces": [
  { "transport": "JSONRPC", "url": "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-jsonrpc" },
  { "transport": "HTTP+JSON", "url": "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-agents-list" }
]
```
Keep `preferredTransport: "JSONRPC"`.

### 4. Skills polish
For each of the 6 skills:
- Add `pricing` hint (per-lead / per-reply cents) sourced from `a2a-openapi` schema, so registries can show "from $X / lead".
- Trim `description` to ≤ 160 chars (registry list views truncate).
- Keep `examples` (good for LLM-driven discovery) but cap at 2 each.
- Add `outputSchema` reference: `"outputSchemaRef": "https://yourechoagent.com/.well-known/openapi.json#/components/schemas/Job"`.

### 5. Security scheme clarity
- Rename key from `"bearer"` to `"echoApiKey"` (more descriptive in registry UIs).
- Add `bearerFormat: "eak_*"` so consumers know the token shape.
- Add a second scheme entry referencing the OAuth/JWT user flow for hosted-UI callers (optional, matches OpenAPI's `UserJWT`).

### 6. Discovery cross-links
Add:
- `"openapi": "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-openapi"` (parity with `agent.json`).
- `"wellKnownUrl": "https://yourechoagent.com/.well-known/agent-card.json"` (self-reference some registries require for canonicalization).
- `"protocol": "a2a/0.3.0"` (mirrors `agent.json`).

### 7. Keep both files in sync
After updating `agent-card.json`, mirror the new fields (name, tags, contact, iconUrl) into:
- `public/.well-known/agent.json`
- `public/agent.json`
- `supabase/functions/well-known-agent/index.ts` (dynamic version)

## Out of scope
- No edge-function logic changes.
- No new endpoints — only metadata fields the existing functions already implement.
- No DB or auth changes.

## Validation
After edits:
1. `curl https://yourechoagent.com/.well-known/agent-card.json | jq` — confirm valid JSON and all URLs resolve.
2. Paste into the A2A registry validator (a2aregistry.org/validate) — expect zero schema errors.
3. Confirm `iconUrl` loads in a browser (200 OK, image content-type).
