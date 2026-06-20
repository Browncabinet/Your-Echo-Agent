# Glama.ai Setup + MCP Server Verification

Goal: get your MCP server published, locally verified, and listed on Glama.ai. Below is the exact order of operations with copy-paste terminal commands.

---

## Part A — Verify the MCP server locally (do this first)

Run these from your local clone of the repo. This catches any build/runtime issues **before** you publish to npm or submit to Glama.

```bash
# 1. Clone & enter the MCP server folder
git clone https://github.com/Browncabinet/yourechoagent.git
cd yourechoagent/mcp-server

# 2. Install + build
npm install
npm run build

# 3. Smoke test — does the binary start?
node dist/index.js
# Should print something like: "Echo Agent MCP server running on stdio"
# Ctrl+C to exit.

# 4. Full inspection via MCP Inspector (interactive UI in your browser)
ECHO_API_KEY=eak_your_test_key_here npm run inspect
# Opens http://localhost:5173 — click "Connect", then:
#   - Tools tab: confirm all 6 tools appear (list_available_agents,
#     get_agent_card, hire_echo_agent, get_job_status, control_job, rate_job)
#   - Call list_available_agents with no args → should return the 6 agents
#   - Call get_agent_card with id="saas-prospector" → should return the card
```

If any of those fail, fix before continuing. Common issues:
- **`ECHO_API_KEY` missing** → set it in the env block
- **401 from API** → key wrong or not yet activated at /for-agents/register
- **Tool not listed** → check `mcp-server/src/index.ts` registers it

---

## Part B — Publish to npm (required for Glama)

Glama lists the npm install command, so the package must be public first.

```bash
# Make sure NPM_TOKEN is set as a GitHub Actions secret first:
#   GitHub repo → Settings → Secrets and variables → Actions → New secret
#   Name: NPM_TOKEN
#   Value: an "Automation" token from https://www.npmjs.com/settings/<you>/tokens

# Tag and push — the publish-mcp.yml workflow does the rest
cd /path/to/yourechoagent
git checkout main && git pull
git tag mcp-v0.1.0
git push origin mcp-v0.1.0

# Watch the workflow
# https://github.com/Browncabinet/yourechoagent/actions

# Verify the package is live (give it ~2 min after the action finishes)
npm view @browncabinet/yourechoagent-mcp
# Should print the package manifest with version 0.1.0
```

Quick end-to-end test that any Glama user could run:

```bash
ECHO_API_KEY=eak_test_xxx npx -y @browncabinet/yourechoagent-mcp
# Should boot and print "Echo Agent MCP server running on stdio"
```

---

## Part C — Verify the MCP server inside Claude Desktop

This is the same install path Glama documents, so confirming it works = your listing will "just work" for every Claude user.

1. Open (or create) `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS, or `%APPDATA%\Claude\claude_desktop_config.json` on Windows.
2. Add this block (merge with existing `mcpServers` if present):

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

3. **Fully quit and reopen Claude Desktop.**
4. In a new chat, click the 🔌 plug icon in the input bar — `echo-agent` should be listed with 6 tools.
5. Test prompt:
   > "Use echo-agent to list available agents filtered by niche `saas`."

If Claude calls `list_available_agents` and returns JSON, you're golden.

---

## Part D — Submit to Glama.ai

1. Go to <https://glama.ai/mcp/servers>
2. Top right → **Add server** → sign in with GitHub
3. Repo URL: `https://github.com/Browncabinet/yourechoagent`
4. Glama parses your root `glama.json` and pre-fills:
   - Name: `yourechoagent-mcp`
   - Description: (from glama.json)
   - Repo, license, maintainers
5. Add/confirm the install block they ask for:
   - **Command:** `npx`
   - **Args:** `-y @browncabinet/yourechoagent-mcp`
   - **Required env:** `ECHO_API_KEY` (description: "Echo Agent API key, prefix `eak_`. Get one at https://yourechoagent.com/for-agents/register")
6. Submit. Approval is typically 24–48h.

Glama also auto-crawls — your repo is already discoverable passively, but manual submit jumps the queue.

---

## Part E — After approval (small follow-ups in this repo)

Once Glama emails you the live listing URL, I'll (in build mode):
1. Replace the placeholder Glama badge in `mcp-server/README.md` with the real listing URL
2. Update the **Submission status** table in `docs/registry-submissions.md`
3. Optionally add an "As seen on Glama" link to the `/for-agents` page

---

## Prompts to copy for your terminal (TL;DR)

```bash
# Local verify
cd mcp-server && npm install && npm run build && node dist/index.js

# MCP Inspector
ECHO_API_KEY=eak_xxx npm run inspect

# Publish
git tag mcp-v0.1.0 && git push origin mcp-v0.1.0

# Confirm published
npm view @browncabinet/yourechoagent-mcp

# Smoke test the published package
ECHO_API_KEY=eak_xxx npx -y @browncabinet/yourechoagent-mcp
```

No code changes are required for any of this — everything is terminal + Glama web form + Claude Desktop config. Approve to proceed and I'll stand by to wire up the badge + status table once the listing goes live.
