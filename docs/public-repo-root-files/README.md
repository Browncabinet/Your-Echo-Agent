# Echo Agent MCP Server

[![CI](https://github.com/Browncabinet/yourechoagent-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/Browncabinet/yourechoagent-mcp/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@browncabinet/yourechoagent-mcp.svg)](https://www.npmjs.com/package/@browncabinet/yourechoagent-mcp)
[![npm downloads](https://img.shields.io/npm/dm/@browncabinet/yourechoagent-mcp.svg)](https://www.npmjs.com/package/@browncabinet/yourechoagent-mcp)
[![license: AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-red.svg)](LICENSE)
[![Glama listed](https://img.shields.io/badge/Glama-listed-22c55e)](https://glama.ai/mcp/servers/Browncabinet/yourechoagent-mcp)
[![smithery](https://img.shields.io/badge/Smithery-deploy-3b82f6)](https://smithery.ai)

> **Discover where your audience gathers — then draft outreach. From any MCP-compatible LLM.**
> Find conferences, webinars, meetups, podcasts, and communities in any niche, then launch personalized outreach campaigns straight from Claude, Cursor, Windsurf, or Continue.

This is the official [Model Context Protocol](https://modelcontextprotocol.io) server for [Echo Agent](https://yourechoagent.com).

> ### ⚠️ Public client — protected backend
>
> This repository is the **thin MCP / A2A client layer** for Echo Agent. The core
> service (event & community discovery pipeline, fit-scoring model, prompt
> engineering, deliverability rules, reply intelligence, and billing/metering)
> runs on our **proprietary hosted backend** and is **not included** in this repo.
>
> That means: cloning gives you a working client for our hosted API, not a
> standalone competing service. Read [`ARCHITECTURE.md`](ARCHITECTURE.md) for
> what's public vs. protected, and see the [License](#license) section for the
> AGPL-3.0 + commercial-competing-services notice.

---

## Why Echo Agent MCP?

- 🔍 **Free discovery tier** — find events & communities without an API key
- 🎯 **Outreach-ready** — every event comes with a draft email + comment variants
- 🤖 **Autonomous agents** — hire one of 6 agents to run end-to-end campaigns with spending caps
- 💳 **Prepaid, pay-per-delivered-email** — no subscription. Autonomous callers get `HTTP 402` + `top_up_url` on low balance ([how it works](https://yourechoagent.com/for-agents/quickstart#how-to-pay))
- 🔒 **HMAC-signed callbacks** — secure webhook events for every job state change
- ⚡ **Two transports** — stdio (Claude Desktop / Cursor / Cline / Zed) and streamable HTTP (Smithery)

## Tools

| Tool | Description | Auth |
|---|---|---|
| `discover_events` | Find conferences, webinars, meetups, podcasts in a niche | Demo (free) |
| `draft_outreach_for_event` | Personalized cold email for a specific event | Demo (free) |
| `generate_comment_for_community` | 2 value-first comment variants for threads | Demo (free) |
| `add_to_radar` | Save event to Radar w/ fit-scoring | `ECHO_API_KEY` |
| `list_available_agents` | Browse 6 Echo agents (optional filter) | `ECHO_API_KEY` |
| `get_agent_card` | Full A2A card for an agent | `ECHO_API_KEY` |
| `hire_echo_agent` | Launch a campaign with one agent | `ECHO_API_KEY` |
| `get_job_status` | Poll a running job | `ECHO_API_KEY` |
| `control_job` | `pause` / `resume` / `cancel` a job | `ECHO_API_KEY` |
| `rate_job` | 1–5 star rating after completion | `ECHO_API_KEY` |

## Quick start

### Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "echo-agent": {
      "command": "npx",
      "args": ["-y", "@browncabinet/yourechoagent-mcp"],
      "env": { "ECHO_API_KEY": "eak_your_key_here" }
    }
  }
}
```

### Cursor

`~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "echo-agent": {
      "command": "npx",
      "args": ["-y", "@browncabinet/yourechoagent-mcp"],
      "env": { "ECHO_API_KEY": "eak_your_key_here" }
    }
  }
}
```

### Windsurf / Continue / generic stdio

Same shape — point any MCP client at `npx -y @browncabinet/yourechoagent-mcp` with `ECHO_API_KEY` set.

### Remote (Smithery, custom HTTP clients)

```
https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http
```

Pass your key as header `x-echo-api-key: eak_...` or query string `?apiKey=eak_...`.

## Get an API key

1. Go to <https://yourechoagent.com/for-agents/dashboard> (sign in with Google)
2. Click **Generate Agent Key** — copy the `eak_…` value (shown once)
3. Set it as `ECHO_API_KEY` in your MCP client config

> `discover_events`, `draft_outreach_for_event`, and `generate_comment_for_community` work without a key (demo tier).

## How to pay

Billing is **prepaid, per delivered email** — no subscription, no card-on-file, no surprise invoices.

| Pack | Price | Emails | Per email |
|---|---|---|---|
| Starter | $25 | 1,500 | $0.017 |
| Growth | $100 | 6,500 | $0.015 |
| **Agency** | **$149** | **10,000** | **$0.0149** |

Every account starts with **50 free emails**. Balance never expires.

**Autonomous / A2A callers:** when your prepaid balance is too low for a hire, the endpoint returns `HTTP 402` with a signed `top_up_url`. Forward it to whoever holds the payment method (human, parent orchestrator, treasury agent), have them top up, then retry the hire with the same `Idempotency-Key` — the job resumes automatically.

Full flow with code samples: <https://yourechoagent.com/for-agents/quickstart#how-to-pay>

## Environment variables

| Name | Required | Description |
|---|---|---|
| `ECHO_API_KEY` | for paid tools | Your Echo Agent key (prefix `eak_`) |
| `ECHO_API_BASE` | no | Override API base URL |

## Example prompts

### Event & community discovery

> "Discover upcoming AI-agent conferences and webinars. Limit to 5 results."

> "Find podcasts where fintech founders gather, then draft a cold email to the host of the first result pitching our spend-management platform."

> "Search for climate-tech webinars, generate 2 thoughtful comment ideas I could post in the community, then save the best event to my Radar."

### Outreach agents

> "Use the SaaS Prospector to find 50 Heads of Growth at Series A fintech SaaS companies. Sender: Jane Doe, jane@acme.io, cap spend at $25."

> "Check status of job `job_abc123` and pause it if more than 30% of replies are negative."

## Security

- Webhook callbacks are signed with **HMAC-SHA256** in `X-Echo-Signature`
- API keys are **hashed at rest**; only the `eak_xxx` prefix is stored in plain text
- The stdio server makes **no telemetry calls**
- See [SECURITY.md](SECURITY.md) for vulnerability reporting

## Local development

```bash
git clone https://github.com/Browncabinet/yourechoagent-mcp.git
cd yourechoagent-mcp
npm install
npm run build
ECHO_API_KEY=eak_... npm run inspect   # opens MCP Inspector
```

## Contributing

PRs welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Links

- 🌐 Website: <https://yourechoagent.com>
- 🚀 Quickstart (3 min): <https://yourechoagent.com/for-agents/quickstart>
- 💳 Billing / How to pay: <https://yourechoagent.com/for-agents/quickstart#how-to-pay>
- 📚 API docs: <https://yourechoagent.com/for-agents/docs>
- 🤖 A2A manifest: <https://yourechoagent.com/.well-known/agent.json>
- 🛠️ OpenAPI: <https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-openapi>
- ⭐ Glama: <https://glama.ai/mcp/servers/Browncabinet/yourechoagent-mcp>

## License

**AGPL-3.0** © Browncabinet — see [LICENSE](LICENSE).

Commercial services that substantially reproduce Echo Agent (event/community
discovery + personalized outreach as a hireable A2A/MCP agent) using this code
or a derivative require **prior written permission**. Building your own product
that integrates with the hosted Echo Agent API is expressly allowed — that's
the whole point. See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the split, and
email `hello@yourechoagent.com` if unsure.
