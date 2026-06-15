# Execute Adoption Push (Steps 1–4)

Skipping step 5 (SDK + examples repo) per the user's note — separate session.

## Step 1 — Google Search Console verify + add property + sitemap
Run via `code--exec` against the gateway (no code changes):
1. `POST /siteVerification/v1/webResource?verificationMethod=META` with `{"site":{"identifier":"https://yourechoagent.com/","type":"SITE"}}` → flips site to verified. (Meta tag is already deployed in `index.html`.)
2. `PUT /webmasters/v3/sites/https%3A%2F%2Fyourechoagent.com%2F` → adds it to the user's property list.
3. `PUT /webmasters/v3/sites/https%3A%2F%2Fyourechoagent.com%2F/sitemaps/https%3A%2F%2Fyourechoagent.com%2Fsitemap.xml` → submits the sitemap.
4. Repeat steps 1–3 for `https://www.yourechoagent.com/` (apex + www are separate GSC properties).

If a call returns `failedToFindMetaTag`, surface that and stop — means latest deploy hasn't propagated.

## Step 2 — AI-discovery metadata (file edits only)
- **Create `public/.well-known/ai-plugin.json`** — ChatGPT plugin spec pointing at `a2a-openapi`. Includes `name_for_model`, `description_for_model`, `auth.type=user_http`, `api.url`, contact, legal links, logo.
- **Rewrite `public/llms.txt`** — concise index: project summary, links to docs, OpenAPI, agent-card, agent.json, pricing, contact. Markdown-style per llmstxt.org spec.
- **Create `public/llms-full.txt`** — long-form: full overview, all 6 skills with examples, 4 ready-to-run curl snippets (list agents, get card, hire, get job), webhook signature spec, error codes, rate limits, idempotency. This is what AI assistants will ingest end-to-end.
- **Add per-agent JSON-LD** — second `<script type="application/ld+json">` block in `index.html` with a `SoftwareApplication` graph (one node per skill + parent `SoftwareApplication` for Echo Agent itself, with `offers`, `applicationCategory`, `featureList`).

## Step 3 — Quickstart panel on `/for-agents`
Add a `<QuickstartSnippets />` component above the existing fold content:
- Tabs: `curl` · `TypeScript (fetch)` · `Python` · `MCP client` · `LangChain tool wrapper`
- Each tab: one syntax-highlighted code block + a "Copy" button (use existing toast for confirmation)
- Below tabs: 3 small badges linking to `agent-card.json`, `agent.json`, OpenAPI spec
- Styling: glass card, DM Sans, subtle Framer fade-in (matches brand memory)
- No backend or schema changes — pure presentation in `src/pages/ForAgents.tsx` + a new `src/components/QuickstartSnippets.tsx`

## Step 4 — Registry submissions checklist
Create `docs/registry-submissions.md` with one section per target. Each section has: URL to submit, fields to paste (name, tagline, description, category, tags, logo URL, agent-card URL, contact), and a checkbox. Targets:
- a2aregistry.org
- wellknown.ai / agents.json directory
- smithery.ai
- Awesome-A2A (GitHub PR)
- ProductHunt (AI Agents topic)
- theresanaiforthat.com
- futurepedia.io
- aiagentsdirectory.com
- Hugging Face Spaces (Agents)
- Anthropic MCP Registry (when public — note as pending)

Also include a "Pre-copy assets" block at top: canonical name, 60-char tagline, 160-char description, logo URL, screenshot URL, category, tags array — so the user pastes from one place.

## Out of scope
- SDK / examples repo (step 5) — defer.
- Paid placements — user decides.
- New backend endpoints or schema changes — none needed.

## Validation after build
1. `curl https://yourechoagent.com/.well-known/ai-plugin.json | jq` — valid JSON, links resolve.
2. `curl https://yourechoagent.com/llms.txt` and `/llms-full.txt` — return text/plain.
3. GSC API call returns `verified: true` for both properties.
4. Visit `/for-agents` preview — quickstart tabs render, copy buttons work.
