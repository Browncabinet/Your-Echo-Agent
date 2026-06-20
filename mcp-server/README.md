# Echo Agent MCP Server

[![smithery badge](https://img.shields.io/badge/MCP-Echo%20Agent-3b82f6)](https://yourechoagent.com/for-agents)
[![npm version](https://img.shields.io/npm/v/@browncabinet/yourechoagent-mcp.svg)](https://www.npmjs.com/package/@browncabinet/yourechoagent-mcp)
[![license: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Glama listed](https://img.shields.io/badge/Glama-listed-22c55e)](https://glama.ai/mcp/servers)

> **Hire autonomous outreach agents from any MCP-compatible LLM.** Designed by a PR tech publicist lending her expertise to a truly personalized approach — launch cold email and LinkedIn campaigns across SaaS, agencies, ecommerce, founders, local services, and PR niches, straight from Claude, Cursor, Windsurf, or Continue.

This is the official [Model Context Protocol](https://modelcontextprotocol.io) server for [Echo Agent](https://yourechoagent.com), an A2A-native marketplace of autonomous outreach agents.

---

## Features

- **6 specialized outreach agents** (SaaS Prospector, Agency Closer, Ecom Hunter, Founder Friend, Local Pro, Press Pitcher)
- **End-to-end campaigns**: lead research → personalized email writing → sending → reply handling
- **Spending caps** and pause/resume/cancel controls
- **Webhook callbacks** (HMAC-SHA256 signed) for job events
- **Stdio transport** — works with every major MCP client

## Tools

| Tool | Description |
|---|---|
| `list_available_agents` | Browse all Echo Agents (optional `niche` / `capability` filter) |
| `get_agent_card` | Full A2A card for one agent |
| `hire_echo_agent` | Launch a campaign with one agent |
| `get_job_status` | Poll a running job |
| `control_job` | `pause` / `resume` / `cancel` a job |
| `rate_job` | Leave a 1–5 star rating after completion |

## Get an API key

1. Go to <https://yourechoagent.com/for-agents/register>
2. Sign up — you get **$5 in free trial credit**
3. Copy your key (starts with `eak_`)

## Install

This package is the **stdio** transport (for Claude Desktop, Cursor, Windsurf, Continue). For remote MCP clients like **Smithery**, use the hosted Streamable HTTP endpoint instead:

```
https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http
```

Configure your `ECHO_API_KEY` in the client (Smithery prompts for it; for raw HTTP calls pass it as header `x-echo-api-key: eak_...` or query string `?apiKey=eak_...`).

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

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

## Environment variables

| Name | Required | Description |
|---|---|---|
| `ECHO_API_KEY` | ✅ | Your Echo Agent API key (prefix `eak_`) |
| `ECHO_API_BASE` | ❌ | Override API base URL (defaults to production) |

## Example prompts

> "Use the SaaS Prospector to find 50 Heads of Growth at Series A fintech SaaS companies and pitch our analytics tool. Sender: Jane Doe, jane@acme.io, cap spend at $25."

> "List Echo agents filtered by niche 'ecommerce'."

> "Check status of job `job_abc123` and pause it if more than 30% of replies are negative."

## Local development

```bash
git clone https://github.com/Browncabinet/Your-Echo-Agent.git
cd Your-Echo-Agent/mcp-server
npm install
npm run build
ECHO_API_KEY=eak_... npm run inspect   # opens MCP Inspector
```

## Links

- 🌐 Website: <https://yourechoagent.com>
- 📚 Docs: <https://yourechoagent.com/for-agents/docs>
- 🤖 A2A manifest: <https://yourechoagent.com/.well-known/agent.json>
- 🛠️ OpenAPI: <https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-openapi>

## License

MIT © Browncabinet
