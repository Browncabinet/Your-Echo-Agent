# Echo Agent MCP Server — Plan

## Important upfront note
I can't create GitHub repos or push code from here. I'll build the full MCP server **inside this project** under a new top-level folder `mcp-server/` (isolated from the Vite app — won't affect the web build). You'll then:
1. Download the `mcp-server/` folder from the Lovable code editor (or via the connected GitHub sync), OR
2. Create the `Browncabinet/yourechoagent-mcp-server` repo on GitHub and copy the folder contents in.

I'll give you exact terminal commands for the push + Glama submission at the end.

## Stack
- **mcp-lite** (lightweight, TS-native MCP SDK) with **stdio transport** (Glama/Claude Desktop standard)
- TypeScript, Node 20+, built with `tsup` → single `dist/index.js`
- Zero runtime deps beyond `mcp-lite` + `zod`
- Published as `@browncabinet/yourechoagent-mcp`

## Folder layout
```text
mcp-server/
├── src/
│   ├── index.ts              # MCP server entrypoint (stdio)
│   ├── client.ts             # Thin fetch wrapper around Echo A2A API
│   ├── tools/
│   │   ├── listAgents.ts
│   │   ├── getAgentCard.ts
│   │   ├── hireAgent.ts
│   │   ├── getJobStatus.ts
│   │   ├── controlJob.ts     # pause | resume | cancel
│   │   └── rateJob.ts
│   └── schemas.ts            # zod input schemas
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── glama.json
├── README.md
├── CHANGELOG.md
├── LICENSE                   # MIT
└── .gitignore
```

## Tools exposed

| Tool | Purpose | Key inputs |
|---|---|---|
| `list_available_agents` | Browse all 6 Echo agents, filter by niche/capability | `niche?`, `capability?` |
| `get_agent_card` | Full agent details + pricing + skills | `agent_id` |
| `hire_echo_agent` | Launch an outreach campaign | `agent_id`, `campaign{goal,target_audience,niche,volume,website_url}`, `sender_identity`, `spending_cap_cents?`, `callback_url?` |
| `get_job_status` | Poll a running job | `job_id` |
| `control_job` | Pause / resume / cancel | `job_id`, `action` |
| `rate_job` | Submit 1–5 star rating after completion | `job_id`, `stars`, `feedback?` |

All tools return structured JSON content blocks. Errors mapped to MCP error responses with the HTTP body included.

## API wiring
- Base URL: `https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1` (the public A2A endpoints already shipped — `a2a-agents-list`, `a2a-agent-get`, `a2a-agent-hire`, `a2a-job-get`, `a2a-job-control`, `a2a-job-rate`)
- Auth: `Authorization: Bearer ${ECHO_API_KEY}` (must start with `eak_`)
- Optional `ECHO_API_BASE` env override for staging

## glama.json
```json
{
  "$schema": "https://glama.ai/mcp/schemas/server.json",
  "maintainers": ["browncabinet"],
  "env": [
    {
      "name": "ECHO_API_KEY",
      "description": "Echo Agent API key (prefix eak_). Get one at https://yourechoagent.com/for-agents/register",
      "required": true
    },
    {
      "name": "ECHO_API_BASE",
      "description": "Override API base URL (defaults to production).",
      "required": false
    }
  ]
}
```

## README highlights
- Glama install badge, npm version badge, MIT badge
- One-click install snippets for **Claude Desktop**, **Cursor**, **Windsurf**, **Continue**, generic stdio
- Tool reference table
- Example prompts ("Hire the SaaS Prospector to find 50 fintech CTOs…")
- Link back to `yourechoagent.com/for-agents`

## CHANGELOG.md
- `0.1.0` — Initial release, 6 tools, stdio transport

## Suggested Glama short description
> Hire autonomous outreach agents from Echo Agent — let your LLM launch personalized cold email and LinkedIn campaigns across SaaS, agencies, ecommerce, founders, local services, and PR niches via the A2A protocol.

## After build — what I'll hand you
1. **GitHub setup commands** (you create the empty repo, I give you the exact `git init` → `git remote add` → `git push` sequence)
2. **Local test command** with MCP Inspector: `npx @modelcontextprotocol/inspector node mcp-server/dist/index.js`
3. **Glama submission URL** (`https://glama.ai/mcp/servers/submit`) + pre-filled metadata
4. **npm publish** commands (optional, for `@browncabinet/yourechoagent-mcp`)

## Out of scope (ask if you want these)
- Actually creating the GitHub repo (needs your account)
- Publishing to npm (needs your `NPM_TOKEN`)
- SSE/HTTP transport variant (stdio is the Glama standard)
- Webhook receiver helper (callback handling stays on your app side)

Approve and I'll build it.