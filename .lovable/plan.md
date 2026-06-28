## Goal
Populate the empty `yourechoagent-mcp` GitHub repo with your MCP server code (no terminal, no GitHub Desktop), then update Glama.ai to point at the new repo.

---

## Part 1 — Upload files to the empty repo (browser only)

1. **Get the files ready on your computer**
   - You already have the `mcp-server` folder on your Desktop (from the Lovable codebase download).
   - Open that folder. You should see: `src/`, `package.json`, `README.md`, `LICENSE`, `tsconfig.json`, `CHANGELOG.md`, `Dockerfile` (if present), etc.

2. **Open the direct upload page**
   - Go to this exact URL in your browser:
     `https://github.com/Browncabinet/yourechoagent-mcp/upload/main`
   - This is GitHub's drag-and-drop upload screen for your empty repo.

3. **Upload in two passes** (GitHub's web uploader needs folders dragged separately)
   - **Pass A — root files:** In your `mcp-server` folder, select only the loose files (`package.json`, `README.md`, `LICENSE`, `tsconfig.json`, `CHANGELOG.md`, `Dockerfile`, `.gitignore` if present). Drag them into the upload zone.
   - Scroll down, commit message: `Initial MCP server release v0.2.0`
   - Click **Commit changes**.
   - **Pass B — the `src/` folder:** Go back to `https://github.com/Browncabinet/yourechoagent-mcp/upload/main`, drag the entire `src` folder in. Commit with message: `Add src/`.

4. **Verify**
   - Visit `https://github.com/Browncabinet/yourechoagent-mcp`
   - Confirm you see `package.json`, `README.md`, `LICENSE`, and the `src/` folder with `index.ts` and `client.ts` inside.

---

## Part 2 — Tag a release so npm + Glama can install it

1. On your new repo page, click **Releases** (right sidebar) → **Create a new release**.
2. **Choose a tag** → type `v0.2.0` → **Create new tag on publish**.
3. Title: `v0.2.0 — Event & community discovery tools`
4. Description: paste the top entry from `CHANGELOG.md`.
5. Click **Publish release**. (If you've set up the npm publish workflow secret, this also publishes to npm.)

---

## Part 3 — Update Glama.ai

1. Go to `https://glama.ai/mcp/servers` → find **Your Echo Agent** → **Edit** (or re-submit if it was removed).
2. Update these fields:
   - **Repository URL:** `https://github.com/Browncabinet/yourechoagent-mcp`
   - **Install command:** `npx -y @browncabinet/yourechoagent-mcp`
   - **Runtime:** Remote (hosted) — URL: `https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http`
   - Keep description + keywords as currently in `glama.json`.
3. Save → Glama will re-scan. The LICENSE file is at the repo root, so the "license not found" error will clear.

---

## Part 4 — (Optional) make main repo private
Once Part 1 is verified: `github.com/Browncabinet/Your-Echo-Agent` → Settings → Danger Zone → **Change visibility → Private**.

---

## Notes
- No code changes are needed in this Lovable project — `glama.json`, `README.md`, and `mcp-server/package.json` already reference the new repo URL.
- If the upload page shows "main branch not found", click **Add file → Create new file**, name it `README.md`, paste one line, commit — then retry the `/upload/main` URL.
