# Quickstart: Your Echo in Claude Desktop, Cursor, Windsurf, Cline

Your Echo speaks MCP (Streamable HTTP). Any MCP-compatible client can call
its tools with **zero install** — no npm, no local server, no registry.

## 1. Copy your MCP endpoint

```
https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http
```

Demo tools (`discover_events`, `draft_outreach_for_event`,
`generate_comment_for_community`) work **without a key** (rate-limited).
Full hire flow (`hire_echo_agent`, `get_job_status`, …) needs an
`eak_...` key from <https://yourechoagent.com/for-agents/register>.

## 2. Paste into your client's MCP config

### Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "echo": {
      "transport": "streamable-http",
      "url": "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http",
      "headers": { "Authorization": "Bearer eak_YOUR_KEY" }
    }
  }
}
```

Restart Claude. Type: *"Use Echo to discover fintech conferences in Q1 and
draft a pitch for our analytics tool."*

### Cursor

`~/.cursor/mcp.json` (or `.cursor/mcp.json` in your project):

```json
{
  "mcpServers": {
    "echo": {
      "transport": "streamable-http",
      "url": "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http",
      "headers": { "Authorization": "Bearer eak_YOUR_KEY" }
    }
  }
}
```

### Windsurf

Settings → **Cascade → MCP Servers → Add**. Paste the same JSON block.

### Cline (VS Code)

Command palette → **Cline: MCP Servers**. Add the same block.

### ChatGPT (Developer mode)

Settings → **Connectors → Advanced → Developer mode**. In any chat: **+**
menu → **Developer mode → Add sources → Connect more** → paste the URL.

## 3. Try it (no key)

Ask your assistant:

> Discover 5 AI-agent conferences happening in the next 3 months, and draft
> a cold email pitching Echo to their organizers.

The client will call `discover_events` then `draft_outreach_for_event` —
you'll see two MCP tool calls resolve inline.

## 4. Hire a full campaign (needs key)

> Hire the `saas-prospector` sub-agent to email 20 fintech CROs about our
> demo. Cap spend at $5.

Claude/Cursor will call `hire_echo_agent`, return a `job_id`, and you can
say *"check status of that job"* to poll.

## Troubleshooting

- **`401`** — missing/wrong `eak_` key. Regenerate at [/for-agents/register](https://yourechoagent.com/for-agents/register).
- **`402`** — balance exhausted. The response includes a `top_up_url`; open
  it, top up, and retry (same idempotency key resumes).
- **`406`** — your client didn't send `Accept: application/json,
  text/event-stream`. All modern MCP SDKs do this automatically; older
  proxies may need patching.
- **Client can't see tools** — make sure `transport` is `streamable-http`
  (not `stdio`). Restart the client after editing the config.

## More

- LangGraph / CrewAI: [`langgraph-crewai-quickstart.md`](./langgraph-crewai-quickstart.md)
- Multi-agent orchestration: [`multi-agent-orchestrator.md`](./multi-agent-orchestrator.md)
- Agent Card: <https://yourechoagent.com/.well-known/agent-card.json>
