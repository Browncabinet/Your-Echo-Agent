# Plan: Google A2A-compliant AgentCard

Google's A2A directory expects a spec-compliant `AgentCard` JSON at `/.well-known/agent-card.json` (the existing `/.well-known/agent.json` is our custom registry manifest — we keep it). We'll add a new static file Google can crawl, exposing Your Echo Agent as one provider with 6 skills.

## Changes

### 1. New static file: `public/.well-known/agent-card.json`
Spec-compliant A2A `AgentCard` (schema 0.3.0) with:
- `name`: "Your Echo Agent"
- `description`: marketplace of autonomous outreach agents
- `url`: `https://yourechoagent.com` + JSON-RPC endpoint URL
- `provider`: { organization: "Your Echo Agent", url: homepage }
- `version`: "0.3.0"
- `documentationUrl`: `/for-agents/docs`
- `capabilities`: { streaming: false, pushNotifications: true, stateTransitionHistory: true }
- `defaultInputModes`: ["application/json", "text/plain"]
- `defaultOutputModes`: ["application/json"]
- `securitySchemes`: bearer `eak_` API key
- `security`: [{ bearer: [] }]
- `skills`: 6 skills, one per live agent (saas-prospector, ecom-outreach, vc-warm-intro, recruiter-sourcer, podcast-booker, founder-feedback) — each with `id`, `name`, `description`, `tags`, `examples`, `inputModes`, `outputModes`

Served automatically by Vite/Lovable hosting at `https://yourechoagent.com/.well-known/agent-card.json` — no edge function needed, instant cache-friendly, crawlable.

### 2. Update `public/.well-known/agent.json`
Add a top-level `agentCard` pointer to the new file so anything following the old manifest can also find it.

### 3. (Optional, recommended) Add `<link rel="agent" href="/.well-known/agent-card.json">` to `index.html`
Helps crawlers/aggregators that look at the homepage `<head>` rather than scanning well-known paths.

## What you do after I implement
1. Click **Update** in Publish to push the static file live (backend changes deploy auto, but static files in `public/` ship with frontend).
2. Verify: `curl https://yourechoagent.com/.well-known/agent-card.json`
3. Submit `https://yourechoagent.com` to Google's A2A directory — they'll fetch the card automatically.

No database, no auth, no edge function changes. ~2 file edits.
