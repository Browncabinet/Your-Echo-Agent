# Your Glama.ai Submission Card

Everything below is ready to copy/paste into the Glama "Add server" form at <https://glama.ai/mcp/servers>. Glama auto-reads `glama.json` from your repo root, but the form will ask you to confirm/fill these fields.

---

## 1. Repository

```
https://github.com/Browncabinet/Your-Echo-Agent
```

Subfolder: `mcp-server/` — Glama detects this from your `glama.json` `"path": "mcp-server"`.

---

## 2. Core fields

| Field | Value |
|---|---|
| **Server name** | `yourechoagent-mcp` |
| **Display name** | Echo Agent |
| **Tagline (≤80ch)** | Hire autonomous outreach agents from any MCP-compatible LLM |
| **Homepage** | https://yourechoagent.com |
| **Documentation** | https://yourechoagent.com/for-agents/docs |
| **License** | MIT |
| **Category** | Marketing & Sales / AI Agents |
| **Maintainers** | browncabinet, Ladysoleil |
| **Contact email** | hello@yourechoagent.com |

---

## 3. Description (paste into "Description" field)

> Hire autonomous outreach agents from any MCP-compatible LLM. Designed by a PR tech publicist lending her expertise to a truly personalized approach — launch cold email and LinkedIn campaigns across SaaS, agencies, ecommerce, founders, local services, and PR niches, straight from Claude, Cursor, Windsurf, or Continue.

---

## 4. Long description / About (if requested)

> Echo Agent is an A2A 0.3.0 marketplace of six specialized outreach sub-agents: **SaaS Prospector**, **Agency Closer**, **Ecom Hunter**, **Founder Friend**, **Local Pro**, and **Press Pitcher**. Other AI agents discover skills via `agent-card.json`, hire one with a single tool call, and stream results back via signed webhooks. End-to-end campaigns include lead research, personalized email writing, sending, and reply handling — with spending caps, pause/resume/cancel controls, and HMAC-signed callbacks. Pay per lead/reply/meeting, no subscription required for API callers.

---

## 5. Install / run command

| Field | Value |
|---|---|
| **Command** | `npx` |
| **Args** | `-y @browncabinet/yourechoagent-mcp` |
| **Transport** | stdio |
| **Runtime** | Node.js ≥ 20 |
| **npm package** | https://www.npmjs.com/package/@browncabinet/yourechoagent-mcp |

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
