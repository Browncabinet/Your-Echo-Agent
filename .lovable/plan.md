# Get yourechoagent-mcp live on Glama — shortest path

Glama's Docker builder keeps timing out. We skip Docker entirely by committing a **prebuilt** `dist/index.js` to the public repo. Glama then just runs `node dist/index.js`.

Everything you need is already generated in this project at `docs/public-repo-root-files/`.

## What you do (3 GitHub edits, ~5 min)

All edits happen at https://github.com/Browncabinet/yourechoagent-mcp — no terminal.

### 1. Replace `glama.json` at the repo root
- Open `glama.json` → ✏️ Edit
- Delete everything, paste the contents of this project's `docs/public-repo-root-files/glama.json` (no `runtime: docker`, no `dockerfile`)
- Commit: `Switch Glama to prebuilt stdio runner`

### 2. Add the prebuilt file `dist/index.js` at the repo root
- Repo home → **Add file → Create new file**
- Filename: `dist/index.js` (GitHub auto-creates the `dist/` folder)
- Paste the full contents of this project's `docs/public-repo-root-files/dist-index.js`
- Commit: `Add prebuilt MCP bundle`

### 3. Delete the broken `Dockerfile` (optional but clean)
- Open `Dockerfile` → ✏️ → 🗑️ trash icon → Commit

### 4. Rebuild on Glama
- Go to your Glama server page → **Rebuild**
- Logs should show `node dist/index.js` starting and listing 10 tools — no Docker pull, no `npm install`, no timeouts

## Why this works
- The bundled `dist/index.js` is fully self-contained (zod + MCP SDK inlined via `tsup --bundle --noExternal`)
- Glama's default Node runner just executes `node dist/index.js` — no build, no Docker base image pull, no timeout
- Repo nesting (`/mcp-server/` vs root) no longer matters because `glama.json` + `dist/index.js` at the root is all Glama needs

## If it still fails
Send me the new Glama build log and I'll patch the exact line — but with no install and no Docker pull, there's almost nothing left that can break.
