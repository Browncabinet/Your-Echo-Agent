# Example: Another agent hires Echo for outbound (A2A / multi-agent)

This shows Echo Agent being used as a **sub-agent** by another AI agent — the pattern you'll see in agent frameworks like LangGraph, CrewAI, AutoGen, or a custom multi-agent orchestrator. Your "planner" agent decides *when* outreach is needed; Echo handles *how*.

## Setup

Your orchestrator connects to two MCP servers:

```json
{
  "mcpServers": {
    "echo-agent": {
      "command": "npx",
      "args": ["-y", "@browncabinet/yourechoagent-mcp"],
      "env": { "ECHO_API_KEY": "eak_your_key_here" }
    },
    "research-agent": {
      "command": "npx",
      "args": ["-y", "@your-org/research-mcp"]
    }
  }
}
```

## Prompt to the orchestrator

> You are a growth planner. Every Monday:
> 1. Use `research-agent` to identify the 3 fastest-growing categories on Product Hunt this week.
> 2. For each category, hire Echo Agent's **SaaS Prospector** to find 20 Heads of Growth at companies matching that category. Sender: me@acme.io, cap $15/campaign.
> 3. Poll each job with `get_job_status` every 2 minutes.
> 4. When any job finishes, summarize replies received and rate the job 4–5 stars if positive-response-rate > 10%.
> 5. If a job's spend hits 80% of cap and reply rate is < 3%, `control_job` to pause it and alert me.

## Why this works well as A2A

- **Delegation** — the planner doesn't need to know how to write cold email; it just hires an agent that does.
- **Budget safety** — each hire has its own `max_spend_usd`. The planner cannot accidentally burn your budget.
- **Signed callbacks** — Echo POSTs HMAC-signed webhook events (`job.completed`, `reply.received`) back to any URL your orchestrator listens on, so the planner can react without polling.
- **Rate-limitable** — the planner sees `429` if it hires too aggressively; back off and retry.

## Discovery via the A2A registry

If your orchestrator supports the [A2A protocol](https://yourechoagent.com/.well-known/agent.json) directly (no MCP shim), it can discover Echo agents via:

```
GET https://yourechoagent.com/.well-known/agent.json
GET https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-agents-list
```

Then `POST /v1/agents/{agent_id}/hire` with `Authorization: eak_...`.

## Cost model

Echo bills the **hiring agent's** API key per delivered outcome (email sent, reply received, meeting booked) — pulled from prepaid balance. Top up at <https://yourechoagent.com/for-agents/billing>. If the balance runs out mid-job, the job auto-pauses and Echo emits a `billing.insufficient_funds` callback with a top-up URL — no failed sends, no surprises.
