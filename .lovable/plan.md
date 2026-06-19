## Goal
Keep the MCP server as `mcp-server/` inside the main Lovable repo, and make Glama pull/build from that subfolder so updates flow automatically when you push.

## Prerequisites
1. **Confirm GitHub is connected to this Lovable project.** Open the Plus (+) menu → GitHub. If not connected: click **Connect project**, pick the `Browncabinet` org, and create a repo (suggest name `yourechoagent`). Lovable auto-syncs both ways after that — every chat edit pushes to `main`.
2. There is no need for me to create a branch for the MCP work — since it's a subfolder, edits ship straight to `main` via Lovable's sync. Branches are only useful if you want to develop the MCP server locally in an IDE; tell me if so and I'll outline that flow instead.

## What I'll do in build mode

### 1. Make the subfolder Glama-ready
- **Move `mcp-server/glama.json` to the repo root as `glama.json`** and set `"path": "mcp-server"` so Glama knows where the package lives. Glama's scanner looks for the manifest at the repo root.
- Add top-level metadata Glama uses: `name`, `description`, `homepage` (`https://yourechoagent.com`), `repository`, `license` (`MIT`), and a `maintainers` block pointing at `@Ladysoleil`.
- Keep `mcp-server/package.json`, `tsup.config.ts`, and `src/` exactly as they are — no code changes.

### 2. Add a root README pointer
- Append a short "MCP Server" section to the project's root `README.md` linking to `mcp-server/README.md`. Glama and humans both check the root README first.

### 3. Add a GitHub Actions release workflow (optional but recommended for Glama)
- New file: `.github/workflows/publish-mcp.yml`
- Triggers on tags matching `mcp-v*` (so tagging `mcp-v0.1.1` cuts a release without touching the main app).
- Steps: checkout → setup Node 20 → `cd mcp-server && npm ci && npm run build && npm publish --access public`.
- Needs one repo secret: `NPM_TOKEN` (you'll add it in GitHub → Settings → Secrets after the repo is connected; I'll surface a reminder in chat).

### 4. Submit to Glama
- After the next push, you go to `https://glama.ai/mcp/servers/add`, paste the GitHub repo URL, and Glama will read the root `glama.json` and index `mcp-server/`. No further config needed.

## Files changed
- `glama.json` (created at root, copied from `mcp-server/glama.json`)
- `mcp-server/glama.json` (deleted to avoid duplicate)
- `README.md` (small section appended)
- `.github/workflows/publish-mcp.yml` (created)

## What I will NOT touch
- `src/`, `supabase/functions/`, anything in the main app
- The published Lovable site
- The MCP server's source code or `package.json`

---

**Two things to confirm before I build:**
1. Repo name when you create it on GitHub — `yourechoagent` ok, or different?
2. Do you want the GitHub Actions auto-publish-to-npm workflow now (#3), or skip it for now and publish manually with `npm publish` from your machine the first time?