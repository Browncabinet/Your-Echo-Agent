## Goal
Swap your old Glama listing (`Your-Echo-Agent`) for the new repo (`yourechoagent-mcp`). Since Glama won't let you change the repo URL on an existing listing ("project url must be within the same repository"), the path is: **submit the new repo as a fresh listing, then archive/abandon the old one**.

No code changes needed — everything in `glama.json`, `Dockerfile`, and `docs/glama-submission-card.md` already points to the new repo.

---

## Step-by-step (browser only)

### 1. Submit the new listing
- Open: **https://glama.ai/mcp/servers/new**
- **Repository URL:** `https://github.com/Browncabinet/yourechoagent-mcp`
- Click Submit. Glama will auto-detect your root `glama.json` + `Dockerfile`.

### 2. Fill in the form (copy/paste values)
Use these from `docs/glama-submission-card.md`:

| Field | Value |
|---|---|
| Display name | `Echo Agent` |
| Tagline | `Hire autonomous outreach agents from any MCP-compatible LLM` |
| Homepage | `https://yourechoagent.com` |
| Docs | `https://yourechoagent.com/for-agents/docs` |
| License | MIT |
| Category | Marketing & Sales / AI Agents |
| Contact | `hello@yourechoagent.com` |

**Description (paste):**
> All-in-one AI outreach: find verified leads, draft hyper-personalized emails, discover conferences/webinars/communities in your niche, and triage replies — all from any MCP client.

**Env var:** `ECHO_API_KEY` (required, placeholder `eak_your_key_here`)

**Install command (stdio):** `npx -y @browncabinet/yourechoagent-mcp`

**Tags:** `mcp, model-context-protocol, a2a, event-discovery, outreach, cold-email, lead-generation, b2b, ai-agents, claude, cursor`

### 3. Retire the old listing
Glama doesn't show a Delete button to non-admins. Two options:
- **Easiest:** ignore it — once the new one is approved and ranking, the old one becomes stale.
- **Cleaner:** email `hello@glama.ai` from your maintainer email with:
  > "Please remove the old listing `Browncabinet/Your-Echo-Agent` — I've migrated the MCP server to a new public repo `Browncabinet/yourechoagent-mcp` and resubmitted."

### 4. After approval
- Verify the new listing builds (Glama runs your Dockerfile and lists 10 tools).
- Update any external links you've shared to point to the new Glama URL.

---

## Pre-flight check (before you submit)

Confirm on `https://github.com/Browncabinet/yourechoagent-mcp` that the repo root contains:
- ✅ `package.json`
- ✅ `glama.json`
- ✅ `Dockerfile`
- ✅ `LICENSE` (MIT)
- ✅ `src/index.ts`
- ✅ A published release (`v0.2.0`)

If any are missing or still nested in `mcp-server/`, fix that first using `docs/public-repo-root-files/CHECKLIST.md` — otherwise Glama will fail the build again.
