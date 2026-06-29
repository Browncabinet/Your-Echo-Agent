# yourechoagent-mcp — Fix-It Checklist (Browser only)

Goal: flatten the repo so `package.json` lives at the **root**, then add `glama.json` + `Dockerfile`, then tag `v0.2.0`.

Repo: https://github.com/Browncabinet/yourechoagent-mcp

---

## Step 1 — Move every file out of `mcp-server/` to the root

For each file below: open it on GitHub → click ✏️ (Edit) → in the **filename box at the top**, delete the `mcp-server/` prefix so only the filename remains → scroll down → **Commit changes**.

Do them one by one in this order:

- [ ] `mcp-server/package.json` → `package.json`
- [ ] `mcp-server/package-lock.json` → `package-lock.json`
- [ ] `mcp-server/tsconfig.json` → `tsconfig.json`
- [ ] `mcp-server/tsup.config.ts` → `tsup.config.ts`
- [ ] `mcp-server/CHANGELOG.md` → `CHANGELOG.md`
- [ ] `mcp-server/LICENSE` → `LICENSE`
- [ ] `mcp-server/src/index.ts` → `src/index.ts`
- [ ] `mcp-server/src/client.ts` → `src/client.ts`

**README:** the root `README.md` is currently a stub. Replace its contents with the contents of `mcp-server/README.md`, then delete `mcp-server/README.md`.

**Delete leftovers:**
- [ ] `mcp-server/EXPORT-TO-PUBLIC-REPO.md` (open it → ✏️ → 🗑️ trash icon → Commit)
- [ ] The now-empty `mcp-server/` folder will disappear on its own once all files are moved.

---

## Step 2 — Add `glama.json` at the root

1. Repo home → **Add file → Create new file**
2. Filename: `glama.json`
3. Paste the contents of `docs/public-repo-root-files/glama.json` (from this Lovable project)
4. Commit

## Step 3 — Add `Dockerfile` at the root

1. **Add file → Create new file**
2. Filename: `Dockerfile`  *(no extension)*
3. Paste the contents of `docs/public-repo-root-files/Dockerfile`
4. Commit

## Step 4 — Tag release `v0.2.0`

1. Repo home → right sidebar → **Releases** → **Create a new release**
2. **Choose a tag** → type `v0.2.0` → "Create new tag: v0.2.0 on publish"
3. **Title:** `v0.2.0 — Event discovery tools`
4. **Description:** paste the `## [0.2.0]` section from `CHANGELOG.md`
5. **Publish release**

## Step 5 — Resubmit to Glama

1. Go to https://glama.ai/mcp/servers/new
2. Paste: `https://github.com/Browncabinet/yourechoagent-mcp`
3. Submit. Install should now succeed (Docker runtime + glama.json + root package.json + tagged release).

---

When all checkboxes are done, the public repo is Glama-ready and npm-installable from the repo root.
