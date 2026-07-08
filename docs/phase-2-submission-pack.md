# Phase 2 — Registry Submission Pack

Everything you need to submit **Your Echo Agent** to every high-signal A2A/MCP registry and AI-agent directory. Copy/paste directly from this file.

- Marketing site: <https://yourechoagent.com>
- Agent Card (A2A 0.3.0): <https://yourechoagent.com/.well-known/agent-card.json>
- Discovery manifest: <https://yourechoagent.com/.well-known/agent.json>
- MCP endpoint (streamable HTTP): `https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http`
- Quickstart + billing: <https://yourechoagent.com/for-agents/quickstart#how-to-pay>
- GitHub: <https://github.com/Browncabinet/yourechoagent-mcp>
- npm: `@browncabinet/yourechoagent-mcp`
- Logo (512×512): <https://storage.googleapis.com/gpt-engineer-file-uploads/tD7SsIWutUN9F1NSev8ED41MLrz2/social-images/social-1775684799020-echo_agent_logo.webp>
- Contact: hello@yourechoagent.com

---

## 1. Optimized Agent Card JSON

The full A2A 0.3.0 card is already live at `/.well-known/agent-card.json`. The lighter **discovery manifest** below is what most registries and crawlers actually fetch — it's what lives at `/.well-known/agent.json` (public/agent.json in the repo). This is the canonical version to paste anywhere a registry asks for "agent.json":

```json
{
  "schemaVersion": "0.3.0",
  "protocol": "a2a/0.3.0",
  "name": "Your Echo Agent",
  "displayName": "Your Echo — The Outreach Agent Other Agents Hire",
  "description": "A2A + MCP outbound-outreach agent that other AI agents hire. Finds verified leads, drafts hyper-personalized emails, discovers events/webinars/communities in your niche, sends, and triages replies. Prepaid, per-delivered-email billing — no subscription. Autonomous callers get HTTP 402 + signed top_up_url when the balance runs low; retry with the same Idempotency-Key resumes the hire.",
  "homepage": "https://yourechoagent.com",
  "agentCard": "https://yourechoagent.com/.well-known/agent-card.json",
  "documentation": "https://yourechoagent.com/for-agents/docs",
  "quickstart": "https://yourechoagent.com/for-agents/quickstart",
  "billingUrl": "https://yourechoagent.com/for-agents/quickstart#how-to-pay",
  "iconUrl": "https://storage.googleapis.com/gpt-engineer-file-uploads/tD7SsIWutUN9F1NSev8ED41MLrz2/social-images/social-1775684799020-echo_agent_logo.webp",
  "tags": [
    "a2a", "mcp", "outreach", "cold-email", "lead-generation",
    "event-discovery", "conferences", "webinars", "communities",
    "linkedin", "b2b", "sales-automation", "marketing", "agent-to-agent",
    "prepaid", "pay-per-result", "autonomous", "marketplace"
  ],
  "category": "marketing-and-sales",
  "provider": { "organization": "Your Echo Agent", "url": "https://yourechoagent.com" },
  "contact": { "email": "hello@yourechoagent.com", "url": "https://yourechoagent.com/for-agents" },
  "termsOfServiceUrl": "https://yourechoagent.com/terms",
  "privacyPolicyUrl": "https://yourechoagent.com/privacy",
  "registry": {
    "agents": "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-agents-list",
    "agentCard": "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-agent-get",
    "hire": "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-agent-hire",
    "job": "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-job-get",
    "jobControl": "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-job-control",
    "jobRate": "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-job-rate",
    "registerAgent": "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-agent-register"
  },
  "openapi": "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-openapi",
  "api_schema": "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-openapi",
  "hostedEndpoint": "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http",
  "transports": ["stdio", "streamable-http"],
  "registryListings": {
    "glama": "https://glama.ai/mcp/servers/@browncabinet/yourechoagent-mcp",
    "smithery": "https://smithery.ai/server/@browncabinet/yourechoagent-mcp",
    "npm": "https://www.npmjs.com/package/@browncabinet/yourechoagent-mcp",
    "github": "https://github.com/Browncabinet/yourechoagent-mcp"
  },
  "auth": {
    "type": "bearer",
    "header": "Authorization",
    "prefix": "eak_",
    "obtain": "https://yourechoagent.com/for-agents/register"
  },
  "billing": {
    "model": "prepaid-per-result",
    "currency": "usd",
    "freeTier": { "emails": 50, "notes": "Free on signup, no card required." },
    "packs": [
      { "id": "starter", "priceUsd": 25,  "emails": 1500  },
      { "id": "growth",  "priceUsd": 100, "emails": 6000  },
      { "id": "agency",  "priceUsd": 149, "emails": 10000 }
    ],
    "insufficientFundsFlow": {
      "httpStatus": 402,
      "responseFields": ["error", "balance_cents", "required_cents", "top_up_url", "retry_after_seconds"],
      "resumeMechanism": "Idempotency-Key",
      "docs": "https://yourechoagent.com/for-agents/quickstart#how-to-pay"
    }
  },
  "callbackSigning": {
    "scheme": "HMAC-SHA256",
    "header": "X-Echo-Signature",
    "headerFormat": "sha256=<hex>",
    "perPartnerSecret": true,
    "eventHeader": "X-Echo-Event",
    "attemptHeader": "X-Echo-Attempt"
  },
  "idempotency": { "header": "Idempotency-Key", "windowHours": 24 },
  "rateLimit":   { "defaultPerMinute": 60, "header": "Authorization-based" },
  "retries":     { "maxAttempts": 5, "backoffSeconds": [60, 300, 1800, 7200, 43200] },
  "capabilities": [
    "email_outreach", "lead_research", "linkedin_assist",
    "event_discovery", "community_engagement", "reply_triage",
    "data-orchestration", "text-optimization", "visualization-rendering"
  ],
  "skills": [
    "saas-prospector", "agency-closer", "ecom-hunter",
    "founder-friend", "local-pro", "press-pitcher"
  ],
  "mcp": {
    "hostedEndpoint": "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http",
    "transports": ["streamable-http", "stdio"],
    "npmPackage": "@browncabinet/yourechoagent-mcp",
    "tools": [
      "list_available_agents", "get_agent_card", "hire_echo_agent",
      "get_job_status", "control_job", "rate_job"
    ]
  }
}
```

> The rich A2A skills array (SaaS Prospector, Agency Closer, Ecom Hunter, Founder Friend, Local Pro, Press Pitcher — each with per-lead / per-reply pricing) already lives in `/.well-known/agent-card.json`. Registries that ask for the full A2A card should link there directly.

---

## 2. Ready-to-copy submission text

Reuse these blocks across every form. Length variants included.

### One-liner (≤80 chars)
> Hire Your Echo — the prepaid A2A/MCP outreach agent other AI agents hire.

### Tagline (≤120 chars)
> Your Echo: the A2A + MCP outreach agent other agents hire. Prepaid, pay per delivered email, HTTP 402 when funds run low.

### Short description (≤160 chars, for meta/OG)
> A2A/MCP outreach agent AI orchestrators hire. Finds leads, drafts personalized emails, discovers events, triages replies. Prepaid, pay per delivered email.

### Medium description (≤300 chars)
> Your Echo is an A2A + MCP outreach agent that other AI agents hire. It finds verified leads, drafts hyper-personalized emails, discovers conferences/webinars/communities in your niche, sends, and triages replies. Prepaid billing, pay per delivered email, HTTP 402 + top_up_url when funds run low.

### Long description (for Product Hunt / AI directories)
> **Your Echo — the outreach agent other agents hire.**
>
> Your Echo is an all-in-one outbound agent exposed over **A2A 0.3.0 and MCP (streamable-http + stdio)**. Any orchestrator — Claude, Cursor, Windsurf, LangGraph, CrewAI, a custom multi-agent stack — can hire it in one tool call. It finds verified leads, drafts hyper-personalized emails, discovers relevant conferences/webinars/podcasts/communities, sends with deliverability safeguards, and triages replies via signed webhooks.
>
> Six specialized sub-agents cover every ICP: **SaaS Prospector, Agency Closer, Ecom Hunter, Founder Friend, Local Pro, Press Pitcher**.
>
> **Built for autonomous callers.** Billing is prepaid and per-delivered-email — no subscription. When the balance runs low, the API returns **HTTP 402 with a signed `top_up_url`**; the paying entity tops up and the same `Idempotency-Key` resumes the hire. HMAC-signed callbacks, spending caps, pause/resume/cancel, and 5-attempt exponential retries are all first-class.
>
> **Pricing:** 50 free emails on signup, then prepaid packs from **$25 (1,500 emails)** to the **$149 Agency pack (10,000 emails)**. Balances never expire.
>
> Get an API key: <https://yourechoagent.com/for-agents/register>
> Billing flow: <https://yourechoagent.com/for-agents/quickstart#how-to-pay>

### Keywords / tags (copy verbatim)
```
a2a, mcp, model-context-protocol, agent-to-agent, autonomous-agent,
outreach, cold-email, lead-generation, event-discovery, conferences,
webinars, communities, linkedin, b2b, marketing, sales-automation,
marketplace, prepaid, pay-per-result, claude, cursor, windsurf,
langgraph, crewai, ai-agents
```

### Claude Desktop / Cursor / Windsurf config snippet
```json
{
  "mcpServers": {
    "your-echo": {
      "command": "npx",
      "args": ["-y", "@browncabinet/yourechoagent-mcp"],
      "env": { "ECHO_API_KEY": "eak_your_key_here" }
    }
  }
}
```

### Remote MCP URL (for Smithery / hosted-only clients)
```
https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http
```
Header: `x-echo-api-key: eak_your_key_here`

### Example prompt (for "Usage" fields)
> "Use Your Echo's SaaS Prospector to find 50 Heads of Growth at Series A fintech SaaS companies and pitch our analytics tool. Sender: Jane Doe, jane@acme.io. Cap spend at $25."

---

## 3. Step-by-step submission checklist

Priority order. Each row = a single sitting.

### A. MCP registries (do first — highest signal for agent buyers)

- [ ] **Glama.ai (refresh existing listing)** — <https://glama.ai/mcp/servers/@browncabinet/yourechoagent-mcp>
  1. Sign in with the GitHub account that owns `Browncabinet/yourechoagent-mcp`.
  2. Open the listing → "Refresh from repo" (Glama re-reads `glama.json` + README).
  3. If any field is stale, edit inline with values from `docs/glama-submission-card.md`. Confirm the description mentions **prepaid**, **$149 Agency pack**, and **HTTP 402 + top_up_url**.
  4. Confirm the icon URL renders and the 6 tools all show up.
  5. Post the refreshed URL to the tracking table in `docs/registry-submissions.md`.

- [ ] **Smithery.ai** — <https://smithery.ai/new>
  1. "Add server" → **Remote (streamable HTTP)**.
  2. URL: `https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http` (NOT the marketing domain — Smithery pings the endpoint).
  3. Paste the `configSchema` from `smithery.yaml` (already correct in repo).
  4. Description: use the **Medium description** above.
  5. Set homepage `https://yourechoagent.com`, docs `https://yourechoagent.com/for-agents/quickstart`.
  6. Publish → grab the final Smithery URL → update `agent-card.json` + tracking table if it changes.

- [ ] **mcp.so** — <https://mcp.so/submit>
  1. Fill form with GitHub repo URL and the Medium description.
  2. Attach the logo URL. Category: "Marketing & Sales".

- [ ] **mcpservers.org** — PR to <https://github.com/wong2/awesome-mcp-servers>
  1. Fork → add one line under **Marketing & Sales** (create the section if missing):
     `- [Your Echo Agent](https://github.com/Browncabinet/yourechoagent-mcp) — Prepaid A2A/MCP outreach agent. Finds leads, drafts personalized emails, discovers events, triages replies. Pay per delivered email.`
  2. Open PR titled `Add Your Echo Agent (outreach)`.

- [ ] **PulseMCP** — <https://www.pulsemcp.com/submit>
  1. Form: name, GitHub URL, npm package, one-liner + medium description.
  2. Category: Sales & Marketing.

- [ ] **Anthropic official MCP Registry** — <https://github.com/modelcontextprotocol/registry>
  1. Follow contribution guide → add `server.json` entry (already staged at `docs/public-repo-root-files/server.json`).
  2. Open PR against `modelcontextprotocol/registry`.

- [ ] **MCP.run** — <https://www.mcp.run/submit> — form-based, use Medium description + repo link.

- [ ] **Cursor Directory (MCP section)** — <https://cursor.directory/mcp> — submit via form; use Cursor config snippet from §2.

- [ ] **Windsurf MCP list** — <https://windsurf.com/mcp> — submit via GitHub PR (README instructs).

### B. A2A registries (differentiator narrative — "agents hire agents")

- [ ] **a2aregistry.org** — <https://a2aregistry.org/submit>
  1. Paste Agent Card URL: `https://yourechoagent.com/.well-known/agent-card.json`.
  2. Confirm all 6 skills, pricing, and security schemes render.

- [ ] **Awesome-A2A** — PR to <https://github.com/google-a2a/awesome-a2a> (or the current top-starred fork)
  1. Add under **Production Agents** → **Sales & Marketing**:
     `- [Your Echo Agent](https://yourechoagent.com/.well-known/agent-card.json) — Prepaid A2A outreach agent. Six specialized sub-agents. HTTP 402 + top_up_url for autonomous callers.`

- [ ] **A2A Protocol Hub** — <https://a2aprotocol.ai/agents/submit> — form + Agent Card URL.

- [ ] **wellknown.ai** — <https://wellknown.ai/submit> — paste `/.well-known/agent.json` URL.

- [ ] **AgentHub / AgentOps directory** — <https://agenthub.dev/submit> (if account required, sign in with GitHub).

- [ ] **AgentCard.dev** — <https://agentcard.dev/register> — Agent Card URL + logo.

### C. Broader AI-agent + AI-tool directories (traffic + SEO)

- [ ] **Product Hunt** — schedule launch <https://www.producthunt.com/posts/new>
  - Tagline: use the ≤120 char tagline. Long copy: Long description block. First comment: the Claude Desktop config snippet + 50-free-emails hook.
- [ ] **Hacker News Show HN** — title: `Show HN: Your Echo — the outreach agent other AI agents hire (A2A + MCP, prepaid)`
- [ ] **Indie Hackers** — <https://www.indiehackers.com/post/new> — Long description + link to Quickstart.
- [ ] **There's An AI For That** — <https://theresanaiforthat.com/submit/>
- [ ] **Futurepedia** — <https://www.futurepedia.io/submit-tool>
- [ ] **AI Agents Directory** — <https://aiagentsdirectory.com/submit>
- [ ] **TopAI.tools** — <https://topai.tools/submit>
- [ ] **AI Tool Hunt** — <https://www.aitoolhunt.com/submit-tool>
- [ ] **Easy With AI** — <https://easywithai.com/submit-tool/>
- [ ] **AIToolsUp** — <https://aitoolsup.com/submit>
- [ ] **Insidr AI Tools** — <https://www.insidr.ai/submit-a-tool/>
- [ ] **G2 (Sales Engagement / AI Sales Assistant)** — <https://sell.g2.com/list-your-product> (higher lift, do after 10+ paying users).

### D. Community push (do the day of / day after submissions)

- [ ] r/AI_Agents post — plain-English pitch + Claude Desktop snippet.
- [ ] r/LocalLLaMA — focus on the A2A/MCP angle, not sales.
- [ ] LangChain Discord `#showcase` — LangGraph example from `examples/langgraph-crewai-quickstart.md`.
- [ ] CrewAI Discord `#showcase` — same example.
- [ ] X/Twitter thread — pin: "Your Echo now speaks A2A + MCP. Any agent can hire it. Prepaid, pay per delivered email. 50 free to start."
- [ ] LinkedIn founder post — same message, longer.

---

## 4. Standing rules for every submission

1. Every listing must contain **one** link to <https://yourechoagent.com/for-agents/quickstart#how-to-pay> so visitors see the payment model without signing up.
2. Every listing must mention **A2A + MCP**, **prepaid / pay-per-delivered-email**, and **50 free emails**.
3. Use the exact display name **"Your Echo"** (or "Your Echo Agent"). Do not shorten to "Echo".
4. Icon URL is the same everywhere (see top of this file). If a form requires an upload, download that WebP and re-upload as `your-echo-logo.png`.
5. After each submission, update the tracking table in `docs/registry-submissions.md` with the live URL and date.
