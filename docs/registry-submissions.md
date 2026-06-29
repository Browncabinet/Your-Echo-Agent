# Registry Submissions Checklist

Submit Echo Agent to these directories to drive A2A/MCP agent adoption. Pre-copy assets below; use them everywhere.

---

## Submission status

| Registry | Status | Live URL | Submitted |
|---|---|---|---|
| Glama.ai | ☐ pending | — | — |
| Smithery.ai | ☐ pending | — | — |
| mcpservers.org (MCP servers repo) | ☐ pending | — | — |
| Anthropic MCP Registry | ☐ waiting on public launch | — | — |
| a2aregistry.org | ☐ pending | — | — |
| wellknown.ai | ☐ pending | — | — |
| Awesome-A2A | ☐ pending | — | — |
| There's An AI For That | ☐ pending | — | — |
| Futurepedia | ☐ pending | — | — |
| AI Agents Directory | ☐ pending | — | — |
| TopAI.tools | ☐ pending | — | — |
| Easy With AI | ☐ pending | — | — |
| AI Tool Hunt | ☐ pending | — | — |
| Product Hunt | ☐ pending | — | — |
| Hacker News (Show HN) | ☐ pending | — | — |
| Indie Hackers | ☐ pending | — | — |

Update this table as each listing goes live.

---

## ⚠️ Smithery URL gotcha (read before submitting to Smithery)

Smithery's scanner is a **remote HTTP probe** — it does NOT read the repo. The **MCP Server URL** field on the Smithery form must be the edge function endpoint, NOT the marketing domain:

✅ Correct:
```
https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http
```

❌ Wrong (returns HTML from the SPA → "Unexpected content type: text/html" / "No capabilities found"):
```
https://yourechoagent.com/...
https://yourechoagent.com/mcp
```

If you see `No capabilities found` or `Unexpected content type: text/html`, the URL field is wrong. Moving files in the repo will not fix it — only the URL field matters.

---

## 0. Pre-flight (do once before any submission)

1. **Publish the npm package.** Tag a release so the `publish-mcp.yml` GitHub Action publishes `@browncabinet/yourechoagent-mcp`:
   ```bash
   git checkout main && git pull
   git tag mcp-v0.1.0
   git push origin mcp-v0.1.0
   ```
   Verify it lands at <https://www.npmjs.com/package/@browncabinet/yourechoagent-mcp>.
   Requires `NPM_TOKEN` repo secret (GitHub → Settings → Secrets and variables → Actions).

2. **Confirm `glama.json` is at the repo root** (already committed). Glama's crawler scans the root only.

3. **Verify public URLs return 200:**
   - <https://yourechoagent.com/.well-known/agent-card.json>
   - <https://yourechoagent.com/.well-known/agent.json>
   - <https://yourechoagent.com/.well-known/ai-plugin.json>
   - <https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-openapi>

---

## 1. Glama.ai (priority #1)

📋 **Ready-to-paste submission card:** [`docs/glama-submission-card.md`](./glama-submission-card.md)

Two paths — do both.


### Path A — Auto-discovery (passive)
Glama periodically crawls public GitHub repos for a valid root-level `glama.json`. Yours is committed, so it will be picked up within 1–7 days automatically.

### Path B — Manual submission (faster, recommended)
1. Go to <https://glama.ai/mcp/servers>
2. Click **Add server** (top right) → sign in with GitHub
3. Paste repo URL: `https://github.com/Browncabinet/yourechoagent-mcp`
4. Glama reads `glama.json` and pre-fills the listing
5. Confirm fields before submit:
   - **Name:** `yourechoagent-mcp`
   - **Install command:** `npx -y @browncabinet/yourechoagent-mcp`
   - **Required env var:** `ECHO_API_KEY` (prefix `eak_`)
   - **Get API key:** <https://yourechoagent.com/for-agents/register>
6. Submit — approval is usually 24–48h.

### Glama release / install validation
1. Make sure the public repo has `dist/index.js` committed at the root.
2. Make sure the root `glama.json` does **not** include `runtime: docker` or `dockerfile`.
3. Add required environment variable `ECHO_API_KEY` with a placeholder/default like `eak_your_key_here` if Glama asks for one.
4. Deploy the install test. Glama should clone the repo, then start `node /app/dist/index.js` for stdio tool inspection.
5. When the install test succeeds, click **Make Release** / **Create Release**.

### Earn the Glama quality badge
- ✅ README with Claude / Cursor / Windsurf install snippets (done)
- ✅ MIT LICENSE (done)
- ✅ Public npm package (after step 0.1)
- ⬜ Add a 512×512 `mcp-server/logo.png` (optional but boosts ranking)
- ✅ `npm run inspect` works for MCP Inspector validation

---

## 2. Other MCP-specific registries

### Smithery.ai
Smithery requires a **hosted HTTPS MCP server speaking Streamable HTTP** — it no longer accepts stdio/GitHub-only submissions. We host one as a Lovable Cloud edge function (`supabase/functions/mcp-http`).

**Hosted endpoint:** `https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http`
**Transport:** Streamable HTTP
**Config:** `smithery.yaml` at repo root declares required field `echoApiKey`, mapped to header `x-echo-api-key`.

Steps:
1. Verify the endpoint is live with an MCP `initialize` POST (Accept must include `application/json, text/event-stream`).
2. Go to <https://smithery.ai/new> → sign in with GitHub.
3. Paste the hosted URL above (NOT the GitHub repo).
4. Smithery scans the server. If the scan can't enumerate tools, it falls back to `https://yourechoagent.com/.well-known/mcp/server-card.json`.
5. Confirm config field `echoApiKey`; get-key URL `https://yourechoagent.com/for-agents/register`.
6. Submit. Once approved, add the Smithery install badge to `mcp-server/README.md`.

### mcpservers.org / official servers repo
- Open a PR against <https://github.com/modelcontextprotocol/servers>
- PR title: `Add Echo Agent — A2A/MCP outreach marketplace`
- Add an entry under the community section linking to repo + npm package

### Anthropic Official MCP Registry
- Watch <https://github.com/modelcontextprotocol/registry> for public launch
- Submit once open using the same `glama.json` metadata

---

## 3. A2A registries (agent-card.json, not MCP)

### a2aregistry.org
1. <https://a2aregistry.org/submit>
2. Paste Agent Card URL: `https://yourechoagent.com/.well-known/agent-card.json`
3. They auto-validate against the A2A 0.3.0 spec

### wellknown.ai
1. <https://wellknown.ai>
2. Submit `https://yourechoagent.com/.well-known/agent.json`

### Awesome-A2A (GitHub PR)
Fork <https://github.com/google-a2a/awesome-a2a> and add under **Marketplaces**:
```markdown
- [Echo Agent](https://yourechoagent.com) — A2A 0.3.0 marketplace of 6 outreach sub-agents. Pay per lead/reply.
```
Then open the PR.

---

## 4. General AI tool directories

For each form, paste the pre-copy assets from the section below.

| Registry | URL | Notes |
|---|---|---|
| There's An AI For That | https://theresanaiforthat.com/submit | Category: Sales/Outreach |
| Futurepedia | https://www.futurepedia.io/submit-tool | Paid fast-track available |
| AI Agents Directory | https://aiagentsdirectory.com/submit | Free |
| TopAI.tools | https://topai.tools/submit | Free |
| AIToolsClub | https://aitoolsclub.com/submit-ai-tools | Free |
| Easy With AI | https://easywithai.com/submit | Free |
| AI Tool Hunt | https://www.aitoolhunt.com/submit | Free |
| Hugging Face Spaces | https://huggingface.co/spaces | Create a Space linking to homepage |

---

## 5. Launch platforms (after registries are live)

- [ ] **Product Hunt** — schedule launch in "AI Agents" topic (Tue/Wed best)
- [ ] **Hacker News Show HN** — title: `Show HN: Echo Agent – hire an AI agent to do your cold outreach (A2A/MCP)`
- [ ] **Indie Hackers** — post in "Show IH" milestone
- [ ] **Reddit** — r/AI_Agents, r/LangChain, r/LocalLLaMA, r/SaaS (check rules)

---

## 6. Developer ecosystems

- [ ] **LangChain community tools** — PR against https://github.com/langchain-ai/langchain
- [ ] **LlamaIndex Tool Spec** — https://github.com/run-llama/llama-hub
- [ ] **CrewAI Tools** — https://github.com/joaomdmoura/crewAI-tools
- [ ] **OpenAI GPTs** — publish a custom GPT calling our OpenAPI

---

## 7. Communities (post once per week, don't spam)

- [ ] A2A Discord (Google-hosted)
- [ ] MCP Discord (Anthropic)
- [ ] LangChain Discord — #showcase
- [ ] AI Engineer Slack — #show-and-tell

---

## Pre-copy assets (paste into any submission form)

| Field | Value |
|---|---|
| **Name** | Echo Agent |
| **Tagline (60ch)** | Hireable 24/7 A2A outreach agent for AI agents |
| **Description (160ch)** | A2A/MCP-native marketplace of autonomous outreach agents. Discover, hire & delegate personalized cold email + LinkedIn campaigns. Pay per result. |
| **Long description** | Echo Agent is an A2A 0.3.0 marketplace of six specialized outreach sub-agents (SaaS Prospector, Agency Closer, Ecom Hunter, Founder Friend, Local Pro, Press Pitcher). Other AI agents discover skills via `agent-card.json`, hire one with a single POST, and stream results back via signed webhooks. Pay per lead/reply/meeting, no subscription required for API callers. |
| **Homepage** | https://yourechoagent.com |
| **Agent Card** | https://yourechoagent.com/.well-known/agent-card.json |
| **Agent Manifest** | https://yourechoagent.com/.well-known/agent.json |
| **OpenAPI** | https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-openapi |
| **Docs** | https://yourechoagent.com/for-agents/docs |
| **Logo URL** | https://storage.googleapis.com/gpt-engineer-file-uploads/tD7SsIWutUN9F1NSev8ED41MLrz2/social-images/social-1775684799020-echo_agent_logo.webp |
| **Contact** | hello@yourechoagent.com |
| **Category** | marketing-and-sales / AI agents / outreach |
| **Tags** | outreach, cold-email, lead-generation, linkedin, b2b, marketing, sales-automation, marketplace, a2a, mcp |
| **License / pricing** | Pay-per-result API + weekly subscription tiers for hosted UI |
| **MCP install** | `npx -y @browncabinet/yourechoagent-mcp` (env: `ECHO_API_KEY`) |

---

## After each submission

1. Update the **Submission status** table at the top with the live URL + date
2. Set a 90-day calendar reminder to refresh metadata
3. Once 3+ listings are approved, add an "As seen on…" strip to `/for-agents` for social proof
