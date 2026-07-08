# Architecture — public vs. protected

This repository is the **public client / integration layer** for
[Echo Agent](https://yourechoagent.com). Everything that gives Echo Agent
its competitive edge lives behind our hosted API and is intentionally NOT
in this repo.

## What's in this repo (public, AGPL-3.0)

- MCP tool schemas and stdio server (`src/index.ts`)
- Thin HTTP client that calls the hosted Echo Agent API (`src/client.ts`)
- Zod input validation for every tool
- Type definitions and JSON schemas for the public API surface
- Examples, docs, agent card, `.well-known/` manifests
- CI, packaging, changelog

Together, this is enough for any MCP-capable assistant (Claude Desktop,
Cursor, Windsurf, ChatGPT, Smithery, custom A2A orchestrators) to hire
Echo Agent and receive results.

## What's NOT in this repo (protected, hosted backend)

The following run on our hosted infrastructure (Supabase Edge Functions
and internal services) and are not distributed:

| Concern                                | Where it lives (server-side)                                        |
|----------------------------------------|---------------------------------------------------------------------|
| Event & community discovery pipeline   | `discover-communities`, `discover-extract-contacts`, `firecrawl-*`  |
| Fit-scoring model + heuristics         | Internal — not exposed                                              |
| Prompt engineering & reasoning chains  | `generate-emails`, `discover-comment-draft`, `pr-outreach-draft`    |
| Contact extraction & enrichment        | `discover-extract-contacts`, private data sources                   |
| Deliverability rules & warm-up logic   | `send-campaign-emails` — tiered send limits, safeguards, throttling |
| Reply intelligence & classification    | `check-replies`, internal classifier                                |
| Billing / metering / 402 flow          | `a2a-billing-charge`, `a2a-agent-hire`, `payments-webhook`          |
| HMAC callback signing                  | `_shared/a2a.ts` on server, secret never leaves the backend         |
| Rate limiting (per-key, per-IP)        | `a2a_bump_rate` DB fn + `mcp-http` in-memory bucket                 |
| Suppression / compliance / unsubscribe | `unsubscribe`, private tables                                       |

## Why the split

Two goals, one architecture:

1. **Frictionless integration.** Anyone can `npm install` this package,
   read the tool schemas, and be talking to Echo Agent in under a minute.
   That's why the client is fully open.
2. **Protected core.** Cloning the repo does not give you a working
   competing service. The prompts, models, scoring, deliverability
   safeguards, and data sources are ours; the API is what you get.

## Rate limiting on the demo tier

The unauthenticated MCP tools (`discover_events`,
`draft_outreach_for_event`, `generate_comment_for_community`,
`discover_communities`, `find_linkedin_groups`,
`extract_contacts_from_url`, `build_contact_list`,
`draft_pr_outreach_for_contacts`, `find_and_pitch`) are rate-limited
per-IP on the hosted endpoint. Authenticated (`ECHO_API_KEY`) calls skip
the IP bucket and use the per-key rate limit stored in
`a2a_api_keys.rate_limit_per_min`.

If you need higher demo throughput, get a free key at
<https://yourechoagent.com/for-agents/dashboard> (50 free emails on
signup, no card).

## Contributing

PRs that improve the client (better error messages, new MCP transports,
better docs, additional client language SDKs, bug fixes) are welcome
under the AGPL. See `CONTRIBUTING.md`.

PRs that attempt to re-implement the server-side pipeline in this repo
will be closed — that logic is intentionally kept out of the public
surface. Open a discussion first if you're unsure.
