## Verification of `Browncabinet/yourechoagent-mcp`

**What's good ✅**
- Repo is **Public**, MIT licensed (root `README.md` + nested `LICENSE`).
- All MCP source files uploaded: `src/`, `package.json`, `package-lock.json`, `tsconfig.json`, `tsup.config.ts`, `CHANGELOG.md`, `README.md`.
- README renders correctly with badges, tools table, install snippets.
- TypeScript 100% — clean language detection.

**Problems to fix ⚠️**

1. **Everything is nested in `/mcp-server/` instead of at the repo root.** This breaks:
   - `npm install` from the repo (no root `package.json`)
   - Glama auto-build (it looks for `package.json` + `Dockerfile` at root)
   - Smithery's GitHub scanning
2. **No `glama.json`** at root → Glama install will fail again with the same "server can not be installed" error.
3. **No `Dockerfile`** at root → Glama's Docker runtime can't build.
4. **No release / git tag** → npm publish workflow won't trigger; Glama can't pin a version.
5. **`EXPORT-TO-PUBLIC-REPO.md`** is leftover internal instructions — should be removed from the public repo.

---

## Plan to fix (browser-only, no terminal)

### Step 1 — Move all files from `/mcp-server/` to the repo root
On `github.com/Browncabinet/yourechoagent-mcp`:
1. Open each file in `mcp-server/` (e.g. `package.json`).
2. Click the **pencil (Edit)** icon.
3. In the filename box at the top, **delete the `mcp-server/` prefix** so it becomes just `package.json`.
4. Click **Commit changes**.
5. Repeat for: `package.json`, `package-lock.json`, `tsconfig.json`, `tsup.config.ts`, `README.md`, `CHANGELOG.md`, `LICENSE`, and every file inside `src/` (`index.ts`, `client.ts`).
6. Delete the now-empty `mcp-server/` folder and `EXPORT-TO-PUBLIC-REPO.md`.

GitHub auto-renames are slow but reliable for non-technical users — no terminal needed.

### Step 2 — Add `glama.json` at the root
Use the **"Add file → Create new file"** button, name it `glama.json`, and paste the content from this Lovable project's root `glama.json` (already configured with Docker runtime + ECHO_API_KEY).

### Step 3 — Add `Dockerfile` at the root
Same flow — create `Dockerfile`, paste content from this project's root `Dockerfile`, but **remove the `mcp-server/` prefix** from every `COPY` path since files now live at root.

### Step 4 — Create a Release `v0.2.0`
1. On the repo home → right side → **Releases** → **Create a new release**.
2. Tag: `v0.2.0` · Title: `v0.2.0 — Event discovery tools` · paste the v0.2.0 entry from `CHANGELOG.md`.
3. Click **Publish release**.

### Step 5 — Re-submit to Glama
On `glama.ai/mcp/servers/new`, paste `https://github.com/Browncabinet/yourechoagent-mcp` again. With root-level `package.json` + `glama.json` + `Dockerfile` + a `v0.2.0` tag, install will succeed.

---

## What I'll prepare for you (after you approve)
- Generate the **exact root-level `Dockerfile`** (paths adjusted, no `mcp-server/` prefix) so you can copy-paste it into GitHub's "Create new file" UI.
- Generate the **exact root-level `glama.json`** (also path-adjusted).
- Provide a **checklist** of which files to rename and in what order so you can do it in ~10 minutes via the browser.

I won't touch your Lovable project files unless you want me to keep them in sync too.

**Ready to proceed?** Approve the plan and I'll generate the two root-level files (`Dockerfile` + `glama.json`) plus the click-by-click rename checklist.