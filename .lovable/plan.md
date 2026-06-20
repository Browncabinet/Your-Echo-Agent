# Registry Submission Playbook

Goal: get Echo Agent's MCP server listed on **Glama.ai** first, then roll out to the other registries already tracked in `docs/registry-submissions.md`. No code changes — this is a checklist + copy/paste assets you'll execute outside Lovable (GitHub, npm, registry web forms).

---

## 0. Pre-flight (do once)

Before any submission, confirm these are live:

1. **npm package published.** Tag a release so the GitHub Action publishes `@browncabinet/yourechoagent-mcp`:
   ```bash
   git checkout main && git pull
   git tag mcp-v0.1.0
   git push origin mcp-v0.1.0
   ```
   Verify: <https://www.npmjs.com/package/@browncabinet/yourechoagent-mcp>
   Requires `NPM_TOKEN` secret in GitHub → Settings → Secrets → Actions.

2. **`glama.json` is at repo root** (it is — confirmed). Glama scans the repo root for this file.

3. **Public URLs reachable** (200 OK):
   - <https://yourechoagent.com/.well-known/agent-card.json>
   - <https://yourechoagent.com/.well-known/agent.json>
   - <https://yourechoagent.com/.well-known/ai-plugin.json>
   - OpenAPI: <https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-openapi>

---

## 1. Glama.ai (priority #1)

Glama auto-discovers MCP servers from public GitHub repos that contain a valid `glama.json`. Two paths:

### Path A — Auto-discovery (passive)
Glama's crawler periodically scans GitHub for repos with `glama.json` at the root. Since yours is already committed and public, it will be picked up on the next crawl (typically 1–7 days).

### Path B — Manual submission (recommended, faster)
1. Go to <https://glama.ai/mcp/servers>
2. Click **"Add server"** (top right) → sign in with GitHub
3. Paste repo URL: `https://github.com/Browncabinet/yourechoagent`
4. Glama reads `glama.json` and pre-fills the listing
5. Confirm fields:
   - **Name:** yourechoagent-mcp
   - **Description:** (already in glama.json)
   - **Install command:** `npx -y @browncabinet/yourechoagent-mcp`
   - **Env var:** `ECHO_API_KEY` (required)
6. Submit for review (usually approved within 24–48h)

### Glama listing hygiene
Once live, Glama shows a quality badge. Earn it by ensuring:
- ✅ README has install instructions for Claude / Cursor / Windsurf (already done)
- ✅ MIT license file (already done)
- ✅ npm package is public and installable
- ✅ Repo has a logo (add `mcp-server/logo.png` 512×512 — optional but recommended)
- ✅ Working `npm run inspect` for MCP Inspector validation

---

## 2. Other MCP-specific registries

### Smithery.ai
1. Go to <https://smithery.ai/new>
2. Sign in with GitHub
3. Point at the same repo + subfolder `mcp-server/`
4. Smithery auto-generates a one-click install URL for Claude Desktop
5. Add the Smithery install button to `mcp-server/README.md` once approved

### mcpservers.org (community index)
- Open a PR at <https://github.com/modelcontextprotocol/servers> adding Echo Agent to the community section
- Title: `Add Echo Agent — A2A/MCP outreach marketplace`

### Anthropic Official MCP Registry
- Watch <https://github.com/modelcontextprotocol/registry> for public launch
- Once open, submit using the same `glama.json` metadata

---

## 3. A2A registries (for agent-card.json, not MCP)

### a2aregistry.org
1. <https://a2aregistry.org/submit>
2. Paste Agent Card URL: `https://yourechoagent.com/.well-known/agent-card.json`
3. They auto-validate against A2A 0.3.0 spec

### wellknown.ai
1. <https://wellknown.ai>
2. Submit `https://yourechoagent.com/.well-known/agent.json`

### Awesome-A2A (GitHub PR)
- Fork <https://github.com/google-a2a/awesome-a2a>
- Add under **Marketplaces** section:
  ```markdown
  - [Echo Agent](https://yourechoagent.com) — A2A 0.3.0 marketplace of 6 outreach sub-agents. Pay per lead/reply.
  ```
- Open PR

---

## 4. General AI tool directories

Use the pre-copy assets block in `docs/registry-submissions.md` (already prepared). For each:

| Registry | URL | Notes |
|---|---|---|
| There's An AI For That | https://theresanaiforthat.com/submit | Category: Sales/Outreach |
| Futurepedia | https://www.futurepedia.io/submit-tool | Paid fast-track available |
| AI Agents Directory | https://aiagentsdirectory.com/submit | Free |
| TopAI.tools | https://topai.tools/submit | Free |
| Easy With AI | https://easywithai.com/submit | Free |
| AI Tool Hunt | https://www.aitoolhunt.com/submit | Free |

For each form, paste:
- **Name:** Echo Agent
- **Tagline:** Hireable 24/7 A2A outreach agent for AI agents
- **Logo:** https://storage.googleapis.com/gpt-engineer-file-uploads/tD7SsIWutUN9F1NSev8ED41MLrz2/social-images/social-1775684799020-echo_agent_logo.webp
- **Description:** (long version from `docs/registry-submissions.md`)

---

## 5. Launch platforms (after registries are live)

1. **Product Hunt** — schedule in "AI Agents" topic, ideally a Tuesday/Wednesday launch
2. **Hacker News Show HN** — title: `Show HN: Echo Agent – hire an AI agent to do your cold outreach (A2A/MCP)`
3. **Indie Hackers** — post in "Show IH" milestone
4. **Reddit** — r/AI_Agents, r/LangChain (check rules first)

---

## 6. Tracking

After each submission:
1. Save the live listing URL in `docs/registry-submissions.md` (check the box + add URL next to each item)
2. Set 90-day calendar reminder to refresh metadata
3. Once 3+ registries approve, add an "As seen on" strip to `/for-agents` for social proof

---

## What I'll do once you approve

Switch to build mode and I'll:
1. Update `docs/registry-submissions.md` with this expanded Glama section + step-by-step instructions
2. Add a `## Submission status` tracking table at the top
3. Optionally generate a 512×512 `mcp-server/logo.png` placeholder for Glama (or you upload your existing logo)
4. Add a Smithery install badge placeholder to `mcp-server/README.md`

No app code changes — docs and assets only.
