# Your Glama.ai Submission Card

Everything below is ready to copy/paste into the Glama "Add server" form at <https://glama.ai/mcp/servers>. Glama auto-reads `glama.json` from your repo root, but the form will ask you to confirm/fill these fields.

---

## 1. Repository

```
https://github.com/Browncabinet/yourechoagent-mcp
```

Glama run file: commit the prebuilt `dist/index.js` at the repo root. Glama can then start `node /app/dist/index.js` without Docker.

Release env var: `ECHO_API_KEY` (required, prefix `eak_`; placeholder/default can be `eak_your_key_here` if Glama asks for one).

---

## 2. Core fields

| Field | Value |
|---|---|
| **Server name** | `yourechoagent-mcp` |
| **Display name** | Echo Agent |
| **Tagline (≤80ch)** | Hire prepaid outbound agents from any MCP client — pay per delivered email |
| **Homepage** | https://yourechoagent.com |
| **Documentation** | https://yourechoagent.com/for-agents/docs |
| **Quickstart & Billing** | https://yourechoagent.com/for-agents/quickstart#how-to-pay |
| **License** | MIT |
| **Category** | Marketing & Sales / AI Agents |
| **Maintainers** | browncabinet, Ladysoleil |
| **Contact email** | hello@yourechoagent.com |

---

## 3. Description (paste into "Description" field)

> All-in-one AI outreach: find verified leads, draft hyper-personalized emails, discover conferences/webinars/communities in your niche, and triage replies — all from any MCP client. **Prepaid billing** ($25 / $100 / $149 packs, never expires). Autonomous A2A callers get **HTTP 402 + top_up_url** when the balance runs low, so the paying entity can top up and the same idempotency key resumes the hire.

---

## 4. Long description / About (if requested)

> Your Echo Agent is an all-in-one AI outreach platform exposed over MCP and A2A. It pairs an outbound engine (lead research, personalized email writing, sending, deliverability safeguards, signed-callback reply handling) with an inbound discovery engine (conferences, webinars, podcasts, and communities scored to your niche, with one-click calendar add and AI-drafted comments). Six specialized sub-agents — **SaaS Prospector**, **Agency Closer**, **Ecom Hunter**, **Founder Friend**, **Local Pro**, and **Press Pitcher** — can be hired with a single tool call from Claude, Cursor, Windsurf, or any MCP client. **Billing is prepaid, per delivered email** — no subscription required. Packs from $25 (1,500 emails) to $149 (10,000 emails, Agency rate). Spending caps, pause/resume/cancel, HMAC-signed webhooks, and a full 402 flow for autonomous callers. See [Quickstart · How to pay](https://yourechoagent.com/for-agents/quickstart#how-to-pay).

---

## 5. Install / run command

Glama runs the committed prebuilt file at `dist/index.js`. End-users on Claude Desktop / Cursor / Windsurf use `npx` once the npm package is published.

| Field | Value |
|---|---|
| **Glama runtime** | stdio, prebuilt `dist/index.js` committed at repo root |
| **Client command (stdio)** | `npx -y @browncabinet/yourechoagent-mcp` |
| **Transport** | stdio |
| **Runtime** | Node.js ≥ 20 |
| **npm package** | https://www.npmjs.com/package/@browncabinet/yourechoagent-mcp (publish pending) |

---

## 6. Environment variables

| Name | Required | Description |
|---|---|---|
| `ECHO_API_KEY` | ✅ Yes | Echo Agent API key (prefix `eak_`). Get one at https://yourechoagent.com/for-agents/register — first $5 credit is free. |
| `ECHO_API_BASE` | ❌ No | Override API base URL (defaults to production). |

---

## 7. Tools exposed by the server (6)

| Tool | Description |
|---|---|
| `list_available_agents` | Browse all Echo Agents (optional `niche` / `capability` filter) |
| `get_agent_card` | Full A2A card for one agent |
| `hire_echo_agent` | Launch a campaign with one agent |
| `get_job_status` | Poll a running job |
| `control_job` | `pause` / `resume` / `cancel` a job |
| `rate_job` | Leave a 1–5 star rating after completion |

---

## 8. Tags / keywords

```
mcp, model-context-protocol, a2a, outreach, cold-email, lead-generation,
linkedin, b2b, marketing, sales-automation, marketplace, claude, cursor,
ai-agents
```

---

## 9. Logo / icon

Use this URL when the form asks for an icon:

```
https://storage.googleapis.com/gpt-engineer-file-uploads/tD7SsIWutUN9F1NSev8ED41MLrz2/social-images/social-1775684799020-echo_agent_logo.webp
```

If Glama requires a file upload instead of URL, download that image and upload as `echo-agent-logo.png` (it's already 512×512, square).

---

## 10. Example prompts (paste into "Examples" or "Usage" field)

> "Use the SaaS Prospector to find 50 Heads of Growth at Series A fintech SaaS companies and pitch our analytics tool. Sender: Jane Doe, jane@acme.io, cap spend at $25."

> "List Echo agents filtered by niche `ecommerce`."

> "Check status of job `job_abc123` and pause it if more than 30% of replies are negative."

---

## 11. Claude Desktop config snippet (Glama often asks for this)

```json
{
  "mcpServers": {
    "echo-agent": {
      "command": "npx",
      "args": ["-y", "@browncabinet/yourechoagent-mcp"],
      "env": {
        "ECHO_API_KEY": "eak_your_key_here"
      }
    }
  }
}
```
