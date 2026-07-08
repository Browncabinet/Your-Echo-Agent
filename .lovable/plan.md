# Phase 2 GitHub Registry Submission Pack

Create a single new doc, `docs/phase-2-github-submissions.md`, containing everything you can copy-paste. No app code changes.

## What the doc will contain

### 1. Reusable "Your Echo" copy blocks (form-safe, no smart quotes, em dashes replaced with `-`)

- **Name:** `Your Echo`
- **Slug / ID:** `your-echo-agent`
- **Short description (140 chars):**
  `Your Echo - A2A + MCP outbound agent that finds events, warm leads, drafts PR + hyper-personalized emails. Prepaid, pay-per-delivered-email.`
- **Medium description (~500 chars):**
  Focused on: event discovery (conferences, webinars, podcasts, communities), verified warm lead gen, hyper-personalized email + PR pitches, deliverability safeguards, reply triage. Prepaid billing: 50 free emails on signup, packs $25 - $149 (Agency = 10k emails), no subscription, credits never expire.
- **Long description (~1200 chars):** Same themes expanded, includes A2A + MCP interop, hire-me-from-another-agent flow, JSON-RPC endpoints, and billing summary.
- **Tags:** `a2a, mcp, outreach, cold-email, lead-generation, event-discovery, conferences, webinars, podcasts, pr, b2b, sales-automation, agent-to-agent, prepaid, pay-per-result`
- **Capabilities/Skills list** (5 skills): `discover_events`, `find_warm_leads`, `draft_personalized_email`, `send_with_safeguards`, `triage_replies` - each with 1-line description + example input/output.

### 2. Full Agent Card JSON snippet
Trimmed, registry-safe version of `public/.well-known/agent-card.json` with:
- `name: "Your Echo"`
- `provider.organization: "Your Echo"`
- `url: https://yourechoagent.com/a2a`
- `documentationUrl`, `iconUrl`, `capabilities`, `skills[]`, `pricing` block (prepaid + $149 Agency pack), `authentication`, `interfaces` (A2A + MCP).

Ready to drop into a registry PR as `agents/your-echo.json` or inline in markdown.

### 3. itinai.com A2A Hub submission
- Repo: `https://github.com/itinai/a2a-hub` (confirm exact path in PR step)
- File to add: `agents/your-echo-agent.json` (full Agent Card above)
- PR title: `Add Your Echo - A2A outbound outreach agent`
- PR description template (form-safe, markdown): summary, links (homepage, docs, agent-card.json, manifest, GitHub, npm), skills bullet list, billing summary, contact.
- Reviewer comment template for follow-up.

### 4. PulseMCP submission
- Repo: `https://github.com/orgs/pulsemcp` server registry
- File to add: `servers/your-echo.json` (MCP server manifest variant - name, description, npm package `@browncabinet/yourechoagent-mcp`, install command, tools list, homepage, license, tags)
- PR title: `Add Your Echo MCP server - outbound outreach + event discovery`
- PR description template with install snippet:
  ```
  npx -y @browncabinet/yourechoagent-mcp
  ```
- Tools list matches the 5 skills above.

### 5. Step-by-step PR instructions (per registry)
For each:
1. Fork the repo on GitHub
2. Create branch `add-your-echo`
3. Add the specified JSON file at the specified path
4. Commit: `Add Your Echo agent`
5. Open PR against `main` using the provided title + description
6. Post the reviewer comment if no response in 7 days

### 6. Fix note
Flag that `public/.well-known/agent-card.json` still contains `"name": "Echo Agent"` in places. Recommend updating to `"Your Echo"` in build mode before submitting so the fetched card matches submitted copy.

## Files touched
- **New:** `docs/phase-2-github-submissions.md`
- **No code changes** in this plan. (Optional follow-up in a separate build step: rename residual "Echo Agent" strings in `public/.well-known/agent-card.json` to "Your Echo".)

Approve to switch to build mode and write the doc.
