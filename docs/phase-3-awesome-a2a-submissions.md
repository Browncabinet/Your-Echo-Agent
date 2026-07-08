# Phase 3 — Awesome-A2A List Submissions

Ready-to-paste entries for the awesome-list style A2A registries. All use "Your Echo" branding and focus on A2A + MCP outbound outreach and event discovery.

---

## 0. Shared entry (reuse everywhere)

**One-line markdown entry (README bullet style):**

```markdown
- [Your Echo](https://yourechoagent.com) — A2A + MCP outbound outreach agent other agents hire. Discovers events, webinars, podcasts and communities; finds warm leads; drafts hyper-personalized emails and PR pitches; sends with deliverability safeguards; triages replies. Prepaid, pay-per-delivered-email — no subscription. [Agent Card](https://yourechoagent.com/.well-known/agent-card.json) · [Docs](https://yourechoagent.com/for-agents/docs)
```

**Short tag list:** `a2a` `mcp` `outreach` `cold-email` `lead-generation` `event-discovery` `pr` `b2b` `sales-automation` `prepaid`

**Category:** Marketing & Sales / Outbound Communication

---

## 1. ai-boost/awesome-a2a (main list)

**Repo:** https://github.com/ai-boost/awesome-a2a
**File to edit:** `README.md`
**Section:** `## 🤖 Agents` (or the closest "Community Agents / Servers" section — check current headings before committing)

**Entry to paste (keep list alphabetical if the section is sorted):**

```markdown
- [Your Echo](https://yourechoagent.com) — A2A + MCP outbound outreach agent other agents hire. Event/webinar/podcast discovery, warm lead generation, hyper-personalized email + PR pitch drafting, deliverability-safe sending, and reply triage. JSON-RPC A2A endpoint, HTTP 402 top-up flow, prepaid pay-per-delivered-email. [Agent Card](https://yourechoagent.com/.well-known/agent-card.json)
```

**PR title:**

```
Add Your Echo — A2A + MCP outbound outreach agent
```

**PR description:**

```markdown
### Add Your Echo to Awesome-A2A

**Project:** Your Echo — https://yourechoagent.com
**Agent Card:** https://yourechoagent.com/.well-known/agent-card.json
**A2A endpoint (JSON-RPC):** https://yourechoagent.com/a2a
**Docs:** https://yourechoagent.com/for-agents/docs
**Quickstart:** https://yourechoagent.com/for-agents/quickstart

**What it does**
Your Echo is an outbound-outreach agent that other AI agents can hire over A2A or MCP. It discovers relevant events, webinars, podcasts and communities in a niche, finds verified warm leads, drafts hyper-personalized emails and PR pitches, sends with deliverability safeguards, and triages replies.

**Protocols**
- A2A 0.3.0 (JSON-RPC + HTTP+JSON)
- MCP (streamable-http + stdio, npm: `@browncabinet/yourechoagent-mcp`)

**Skills**
`discover_events`, `find_warm_leads`, `draft_personalized_email`, `send_with_safeguards`, `triage_replies`

**Billing**
Prepaid, pay-per-delivered-email. 50 free emails on signup. Packs from $25 to $149 (10k Agency). No subscription, credits never expire. Autonomous callers get HTTP 402 + signed `top_up_url` when balance runs low; retry with the same `Idempotency-Key` resumes the hire.

**Checklist**
- [x] Agent Card served at `/.well-known/agent-card.json`
- [x] Public JSON-RPC endpoint
- [x] MCP server published on npm
- [x] Docs + quickstart live
- [x] Alphabetical placement in section

Happy to adjust wording/placement.
```

---

## 2. pab1it0/awesome-a2a

**Repo:** https://github.com/pab1it0/awesome-a2a
**File to edit:** `README.md`
**Section:** `## Agents` (or nearest agents/servers section)

**Entry:** same one-line markdown from section 0.

**PR title:**

```
Add Your Echo — outbound outreach A2A agent
```

**PR description:** reuse the description from section 1 (identical content is fine across awesome lists).

---

## 3. a2aproject/A2A — Discussion #741 (community agent showcase)

**Repo/thread:** https://github.com/a2aproject/A2A/discussions/741

This is a **discussion comment**, not a PR. Post a new reply.

**Comment to paste:**

```markdown
### Your Echo — A2A + MCP outbound outreach agent

**Homepage:** https://yourechoagent.com
**Agent Card:** https://yourechoagent.com/.well-known/agent-card.json
**A2A JSON-RPC:** https://yourechoagent.com/a2a
**Docs:** https://yourechoagent.com/for-agents/docs
**MCP server:** `npx -y @browncabinet/yourechoagent-mcp`

**Summary**
Outbound-outreach agent other AI agents hire. Discovers events, webinars, podcasts and communities; finds warm leads; drafts hyper-personalized emails and PR pitches; sends with deliverability safeguards; triages replies.

**Protocol notes**
- A2A 0.3.0 — JSON-RPC preferred, HTTP+JSON also exposed
- `push_notifications: true`, `state_transition_history: true`
- Auth: bearer API key (`eak_*`) or user JWT
- Autonomous-friendly billing: HTTP 402 + signed `top_up_url`; resume with `Idempotency-Key`

**Skills**
`discover_events`, `find_warm_leads`, `draft_personalized_email`, `send_with_safeguards`, `triage_replies`

Happy to add usage examples or a hire-flow snippet if useful.
```

---

## 4. PR submission checklist (per repo)

1. Fork the repo on github.com.
2. Create branch: `add-your-echo`.
3. Edit `README.md`, paste the entry from section 0 in the correct section, keep alphabetical order if applicable.
4. Confirm no trailing whitespace, links resolve, one blank line before/after your addition.
5. Commit: `Add Your Echo to agents list`.
6. Open PR with the title and description from the matching section above.
7. Enable "Allow edits by maintainers".
8. If no response in 7 days, post a polite bump comment: "Friendly bump — happy to adjust placement or wording."

---

## 5. Agent Card change summary (what to expect when testing)

Only `public/.well-known/agent-card.json` changed. Diff:

| Field | Before | After |
|---|---|---|
| `name` | `Echo Agent` | `Your Echo` |
| `provider.organization` | `Echo Agent` | `Your Echo` |
| `securitySchemes.echoApiKey.description` | `Echo Agent API key ...` | `Your Echo API key ...` |

`public/.well-known/agent.json` also normalized `Your Echo Agent` → `Your Echo` in `name` and `provider.organization` so both documents match.

**Not changed:** URLs, skills, pricing, capabilities, auth, MCP block, tags, iconUrl.

**Testing expectations**
- Registries that fetch the card will now display **Your Echo** instead of Echo Agent.
- Existing A2A clients keep working — no endpoint, schema, auth or skill changes.
- Deploy the frontend (Publish) so the static `.well-known` files serve the updated JSON before submitting PRs.
