## Goal
Get the MCP server published to npm as `@browncabinet/yourechoagent-mcp` and live on GitHub at `Browncabinet/yourechoagent-mcp-server`, so Glama can verify the listing.

## Part 1 — What I'll do inside this project

1. **Polish `mcp-server/package.json`** for npm publish:
   - Confirm `name`, `version`, `description`, `bin`, `main`, `files`, `keywords`, `license`, `author`, `repository`, `homepage`, `bugs` fields.
   - Add `"publishConfig": { "access": "public" }` (required for scoped package).
   - Add `prepublishOnly` build script so `tsc` runs before publish.
2. **Add `mcp-server/.npmignore`** (or rely on `files` whitelist) so only `dist/`, `README.md`, `LICENSE`, `glama.json` ship.
3. **Verify `tsconfig.json`** outputs to `dist/` with declarations, and `bin` path matches the compiled file.
4. **Smoke build** locally (`cd mcp-server && npm install && npm run build`) to confirm `dist/index.js` is produced and the shebang is intact.

## Part 2 — What you'll do manually (I can't do these for you)

These require your accounts and credentials, which I don't have access to:

### A. Create the GitHub repo
1. Go to https://github.com/new
2. Owner: `Browncabinet`, Repo name: `yourechoagent-mcp-server`, Public, no README/license/gitignore (we already have them).
3. On your machine:
   ```bash
   cd mcp-server
   git init
   git add .
   git commit -m "Initial commit: Echo Agent MCP server"
   git branch -M main
   git remote add origin https://github.com/Browncabinet/yourechoagent-mcp-server.git
   git push -u origin main
   ```

### B. Publish to npm
1. Create npm account at https://npmjs.com/signup if you don't have one.
2. Create the `@browncabinet` org at https://www.npmjs.com/org/create (free for public packages).
3. On your machine:
   ```bash
   cd mcp-server
   npm login
   npm publish --access public
   ```
4. Verify at `https://www.npmjs.com/package/@browncabinet/yourechoagent-mcp`.

### C. Tell Glama
If Glama already accepted the submission, no action needed — they'll detect the live npm + GitHub. If they emailed asking for the repo URL, reply with both links.

## Notes
- The `mcp-server/` folder currently lives inside this Lovable project. For the GitHub repo you'll push **only the `mcp-server/` contents** as the repo root (not the whole Lovable project). The `cd mcp-server && git init` above does exactly that.
- Future updates: bump `version` in `package.json`, `npm publish` again, `git push` to GitHub.
