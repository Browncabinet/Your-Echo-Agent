# Phase 2 - GitHub Registry Submission Pack (Your Echo)

Everything below is form-safe: straight quotes, ASCII hyphens (no em dashes), no smart punctuation. Copy-paste directly into GitHub PRs / registry forms.

---

## 0. Reusable copy blocks

### Name / ID
- **Name:** Your Echo
- **Slug / ID:** `your-echo-agent`
- **Homepage:** https://yourechoagent.com
- **Docs:** https://yourechoagent.com/for-agents/docs
- **Quickstart / billing:** https://yourechoagent.com/for-agents/quickstart#how-to-pay
- **Agent Card:** https://yourechoagent.com/.well-known/agent-card.json
- **Manifest:** https://yourechoagent.com/.well-known/agent.json
- **A2A endpoint:** https://yourechoagent.com/a2a
- **Logo:** https://storage.googleapis.com/gpt-engineer-file-uploads/tD7SsIWutUN9F1NSev8ED41MLrz2/social-images/social-1775684799020-echo_agent_logo.webp
- **GitHub:** https://github.com/Browncabinet/yourechoagent-mcp
- **npm:** `@browncabinet/yourechoagent-mcp`
- **Contact:** hello@yourechoagent.com
- **License:** MIT

### Short description (140 chars)
```
Your Echo - A2A + MCP outbound agent. Finds events, verified warm leads, drafts PR + personalized emails. Prepaid, pay-per-delivered-email.
```

### Medium description (~500 chars)
```
Your Echo is the outreach agent other agents hire. It discovers relevant events (conferences, webinars, podcasts, communities), finds verified warm leads, drafts hyper-personalized cold emails and PR pitches, sends with full deliverability safeguards, and triages replies. Exposed over A2A and MCP so any agent or app can call it. Prepaid, pay-per-delivered-email - no subscription. 50 free emails on signup. Packs from $25 up to the $149 Agency pack (10,000 emails). Credits never expire.
```

### Long description (~1200 chars)
```
Your Echo is a specialist outbound outreach agent built for agent-to-agent (A2A) and MCP interop. Other agents, assistants, and apps call it to run real outreach workflows end to end: event discovery (conferences, webinars, podcasts, newsletters, Slack/Discord communities), verified warm lead generation, hyper-personalized email + PR pitch drafting, safe sending with deliverability guardrails (warmup, throttling, unsubscribe, spam-word screening), and reply triage / classification.

Interfaces:
- A2A JSON-RPC endpoint at https://yourechoagent.com/a2a
- MCP server published as @browncabinet/yourechoagent-mcp (npx one-liner)
- REST + webhooks for non-agent callers

Billing is transparent prepaid, pay-per-delivered-email. No subscription, no seats. 50 free emails on signup. Prepaid packs: Starter $25, Growth $59, Pro $99, Agency $149 (10,000 emails). Balances roll over and never expire. Agents can top up programmatically.

Best for: founders, PR teams, agencies, and other AI agents that need real, sent, tracked outbound - not just drafts.
```

### Tags / capabilities
```
a2a, mcp, outreach, cold-email, lead-generation, event-discovery, conferences, webinars, podcasts, pr, public-relations, b2b, sales-automation, agent-to-agent, prepaid, pay-per-result
```

### Skills (5)
| Skill ID | Title | One-liner |
|---|---|---|
| `discover_events` | Discover events | Find conferences, webinars, podcasts, and communities relevant to a topic or ICP. |
| `find_warm_leads` | Find warm leads | Return verified contacts with role, company, email, and warm-signal context. |
| `draft_personalized_email` | Draft personalized email | Produce a hyper-personalized email or PR pitch grounded in real signals. |
| `send_with_safeguards` | Send with safeguards | Send via SMTP with warmup, throttling, unsubscribe, and deliverability checks. |
| `triage_replies` | Triage replies | Classify replies (interested / not-now / unsubscribe / OOO) and draft next step. |

---

## 1. Full Agent Card JSON (registry-safe)

Drop this into a PR as-is. Same shape as `/.well-known/agent-card.json` but trimmed for registry ingestion.

```json
{
  "schemaVersion": "1.0",
  "name": "Your Echo",
  "id": "your-echo-agent",
  "description": "A2A + MCP outbound outreach agent. Discovers events, finds verified warm leads, drafts hyper-personalized emails and PR pitches, sends with deliverability safeguards, and triages replies. Prepaid, pay-per-delivered-email.",
  "version": "1.0.0",
  "url": "https://yourechoagent.com/a2a",
  "documentationUrl": "https://yourechoagent.com/for-agents/docs",
  "iconUrl": "https://storage.googleapis.com/gpt-engineer-file-uploads/tD7SsIWutUN9F1NSev8ED41MLrz2/social-images/social-1775684799020-echo_agent_logo.webp",
  "provider": {
    "organization": "Your Echo",
    "url": "https://yourechoagent.com",
    "contact": "hello@yourechoagent.com"
  },
  "capabilities": {
    "streaming": true,
    "pushNotifications": true,
    "stateTransitionHistory": true
  },
  "defaultInputModes": ["text", "application/json"],
  "defaultOutputModes": ["text", "application/json"],
  "authentication": {
    "schemes": ["bearer", "apiKey"],
    "signupUrl": "https://yourechoagent.com/for-agents/signup"
  },
  "interfaces": [
    { "type": "a2a", "url": "https://yourechoagent.com/a2a" },
    { "type": "mcp", "package": "@browncabinet/yourechoagent-mcp", "command": "npx -y @browncabinet/yourechoagent-mcp" },
    { "type": "rest", "url": "https://yourechoagent.com/api" }
  ],
  "skills": [
    {
      "id": "discover_events",
      "name": "Discover events",
      "description": "Find conferences, webinars, podcasts, newsletters, and communities relevant to a topic or ICP.",
      "tags": ["event-discovery", "conferences", "webinars", "podcasts", "communities"],
      "examples": ["Find AI infra conferences in Europe in Q3 with open CFPs."]
    },
    {
      "id": "find_warm_leads",
      "name": "Find warm leads",
      "description": "Return verified contacts (name, role, company, email) with warm-signal context from events, content, or hiring signals.",
      "tags": ["lead-generation", "b2b", "verified-emails"],
      "examples": ["Get 25 verified Heads of Growth at Series A SaaS who spoke at SaaStr in the last 12 months."]
    },
    {
      "id": "draft_personalized_email",
      "name": "Draft personalized email",
      "description": "Produce a hyper-personalized cold email or PR pitch grounded in real signals about the recipient.",
      "tags": ["cold-email", "pr", "personalization"],
      "examples": ["Draft a 90-word PR pitch to a TechCrunch reporter covering AI agents."]
    },
    {
      "id": "send_with_safeguards",
      "name": "Send with safeguards",
      "description": "Send via authenticated SMTP with warmup, throttling, unsubscribe handling, and spam-word screening.",
      "tags": ["deliverability", "smtp", "compliance"],
      "examples": ["Send this sequence to 200 leads at 40/day with SPF/DKIM/DMARC checks."]
    },
    {
      "id": "triage_replies",
      "name": "Triage replies",
      "description": "Classify replies (interested, not-now, unsubscribe, OOO, referral) and draft the next best action.",
      "tags": ["reply-handling", "classification"],
      "examples": ["Classify last 24h of replies and draft interested follow-ups."]
    }
  ],
  "pricing": {
    "model": "prepaid-pay-per-result",
    "unit": "delivered_email",
    "freeTier": { "emails": 50, "trigger": "signup" },
    "packs": [
      { "id": "starter", "price_usd": 25, "emails": 1000 },
      { "id": "growth", "price_usd": 59, "emails": 3000 },
      { "id": "pro", "price_usd": 99, "emails": 6000 },
      { "id": "agency", "price_usd": 149, "emails": 10000 }
    ],
    "expiration": "never",
    "subscription": false
  },
  "tags": ["a2a", "mcp", "outreach", "cold-email", "lead-generation", "event-discovery", "pr", "b2b", "sales-automation", "agent-to-agent", "prepaid", "pay-per-result"],
  "license": "MIT"
}
```

---

## 2. itinai.com A2A Hub submission

- **Registry repo:** https://github.com/itinai/a2a-hub  (verify exact path when you fork; if the org uses a different repo name, use whatever the README instructs)
- **File to add:** `agents/your-echo-agent.json`
- **Contents:** the full Agent Card JSON from section 1, unchanged.
- **Branch name:** `add-your-echo-agent`
- **Commit message:** `Add Your Echo - A2A outbound outreach agent`

### PR title
```
Add Your Echo - A2A outbound outreach agent
```

### PR description (paste as-is)
```markdown
## Agent: Your Echo

The outreach agent other agents hire. A2A + MCP outbound agent that discovers events, finds verified warm leads, drafts hyper-personalized emails and PR pitches, sends with deliverability safeguards, and triages replies.

### Links
- Homepage: https://yourechoagent.com
- Agent Card: https://yourechoagent.com/.well-known/agent-card.json
- Manifest: https://yourechoagent.com/.well-known/agent.json
- A2A endpoint: https://yourechoagent.com/a2a
- Docs: https://yourechoagent.com/for-agents/docs
- MCP (npm): https://www.npmjs.com/package/@browncabinet/yourechoagent-mcp
- GitHub: https://github.com/Browncabinet/yourechoagent-mcp
- Contact: hello@yourechoagent.com

### Skills
- discover_events - conferences, webinars, podcasts, communities
- find_warm_leads - verified contacts with warm-signal context
- draft_personalized_email - hyper-personalized cold email + PR pitches
- send_with_safeguards - SMTP with warmup, throttling, unsubscribe
- triage_replies - classify replies and draft next step

### Billing
Prepaid, pay-per-delivered-email. No subscription.
- 50 free emails on signup
- Packs: Starter $25 / Growth $59 / Pro $99 / Agency $149 (10,000 emails)
- Credits never expire

### Checklist
- [x] Agent Card served at /.well-known/agent-card.json
- [x] Manifest served at /.well-known/agent.json
- [x] Public A2A endpoint (JSON-RPC)
- [x] MCP server published to npm
- [x] Docs + signup + billing pages live

License: MIT
```

### Reviewer follow-up comment (post if no reply in 7 days)
```
Friendly bump - happy to make any changes needed for merge. Agent Card at https://yourechoagent.com/.well-known/agent-card.json is live and validating.
```

---

## 3. PulseMCP submission

- **Registry repo:** https://github.com/orgs/pulsemcp/repositories  (open the servers registry - typically `pulsemcp/servers` or the repo the site's "Submit a server" button points to)
- **File to add:** `servers/your-echo.json`
- **Branch name:** `add-your-echo-mcp`
- **Commit message:** `Add Your Echo MCP server`

### MCP server manifest (paste into the JSON file)
```json
{
  "name": "your-echo",
  "displayName": "Your Echo",
  "description": "Outbound outreach MCP server. Discovers events, finds verified warm leads, drafts personalized emails and PR pitches, sends with deliverability safeguards, and triages replies. Prepaid, pay-per-delivered-email.",
  "homepage": "https://yourechoagent.com",
  "repository": "https://github.com/Browncabinet/yourechoagent-mcp",
  "npmPackage": "@browncabinet/yourechoagent-mcp",
  "install": {
    "npx": "npx -y @browncabinet/yourechoagent-mcp"
  },
  "runtime": "node",
  "license": "MIT",
  "author": {
    "name": "Your Echo",
    "email": "hello@yourechoagent.com",
    "url": "https://yourechoagent.com"
  },
  "auth": {
    "type": "apiKey",
    "signupUrl": "https://yourechoagent.com/for-agents/signup",
    "envVar": "YOURECHO_API_KEY"
  },
  "tools": [
    { "name": "discover_events", "description": "Find conferences, webinars, podcasts, and communities for a topic or ICP." },
    { "name": "find_warm_leads", "description": "Return verified contacts with warm-signal context." },
    { "name": "draft_personalized_email", "description": "Draft a hyper-personalized cold email or PR pitch." },
    { "name": "send_with_safeguards", "description": "Send via SMTP with warmup, throttling, unsubscribe, and spam screening." },
    { "name": "triage_replies", "description": "Classify inbound replies and draft the next best action." }
  ],
  "tags": ["outreach", "cold-email", "lead-generation", "event-discovery", "pr", "b2b", "sales-automation", "a2a", "prepaid"],
  "pricing": {
    "model": "prepaid-pay-per-result",
    "freeTier": "50 emails on signup",
    "packs": "Starter $25 / Growth $59 / Pro $99 / Agency $149 (10,000 emails)"
  }
}
```

### PR title
```
Add Your Echo MCP server - outbound outreach + event discovery
```

### PR description (paste as-is)
```markdown
## MCP server: Your Echo

Outbound outreach MCP server. Any MCP-compatible client (Claude, ChatGPT, Cursor, Codex, other agents) can call Your Echo to run real outreach end to end.

### Install
```
npx -y @browncabinet/yourechoagent-mcp
```
Environment variable: `YOURECHO_API_KEY` (get one at https://yourechoagent.com/for-agents/signup - 50 free emails).

### Tools
- discover_events
- find_warm_leads
- draft_personalized_email
- send_with_safeguards
- triage_replies

### Links
- Homepage: https://yourechoagent.com
- Docs: https://yourechoagent.com/for-agents/docs
- GitHub: https://github.com/Browncabinet/yourechoagent-mcp
- npm: https://www.npmjs.com/package/@browncabinet/yourechoagent-mcp
- A2A Agent Card: https://yourechoagent.com/.well-known/agent-card.json

### Billing
Prepaid, pay-per-delivered-email. 50 free emails on signup. Packs $25 to $149 (Agency = 10,000 emails). No subscription. Credits never expire.

License: MIT
```

### Reviewer follow-up comment
```
Friendly bump - happy to adjust the manifest to match your schema. npm package is live and the server responds to standard MCP list-tools / invoke.
```

---

## 4. Step-by-step PR checklist (do this twice - once per registry)

1. Open the registry repo on GitHub and click **Fork**.
2. In your fork, click **Add file -> Create new file**.
3. Path:
   - itinai A2A Hub: `agents/your-echo-agent.json`
   - PulseMCP: `servers/your-echo.json`
4. Paste the JSON from section 1 (itinai) or section 3 (PulseMCP).
5. Scroll down, choose **Create a new branch** and name it `add-your-echo-agent` (or `add-your-echo-mcp`), then **Propose new file**.
6. Click **Compare & pull request**.
7. Set the PR title from section 2 or 3.
8. Paste the PR description from section 2 or 3.
9. Submit the PR.
10. If no reviewer response in 7 days, post the follow-up comment from section 2 / 3.

---

## 5. One thing to fix before submitting

`public/.well-known/agent-card.json` still has `"name": "Echo Agent"` and `"organization": "Echo Agent"` in a few places. Since itinai and other registries **fetch** the card, the registry listing will display "Echo Agent" instead of "Your Echo" and look inconsistent with the submission text above.

Fix: rename every `"Echo Agent"` -> `"Your Echo"` in `public/.well-known/agent-card.json` and republish before opening the PRs. Say the word and I will do it.
