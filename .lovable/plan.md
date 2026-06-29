# Fix `yourechoagent-mcp` Repo for Glama

## Audit Results

I checked `https://github.com/Browncabinet/yourechoagent-mcp`. Three problems are blocking Glama:

| Issue | Current | Required |
|---|---|---|
| Files location | Everything nested in `/mcp-server/` subfolder | Must be at repo **root** |
| Dockerfile name | `Dockfile` (typo — missing the "er") | Must be exactly `Dockerfile` |
| `glama.json` location | Inside `/mcp-server/` | Must be at repo **root** |

That's why your Glama build failed with `Cannot find module '/app/dist/index.js'` — Glama never found `package.json` at the root, so it couldn't install or build anything.

## Fix Plan (browser-only, ~10 minutes)

### Step 1 — Flatten the repo (move files to root)

On GitHub, you can move a file by editing it and changing its path. For each of these 9 files, open it, click the pencil ✏️, and delete `mcp-server/` from the filename field at the top:

- `mcp-server/README.md` → `README.md` (overwrite the root README)
- `mcp-server/package.json` → `package.json`
- `mcp-server/package-lock.json` → `package-lock.json`
- `mcp-server/tsconfig.json` → `tsconfig.json`
- `mcp-server/tsup.config.ts` → `tsup.config.ts`
- `mcp-server/LICENSE` → `LICENSE`
- `mcp-server/CHANGELOG.md` → `CHANGELOG.md`
- `mcp-server/glama.json` → `glama.json`
- `mcp-server/src/index.ts` → `src/index.ts` (and any other files inside `src/`)

For each: open file → pencil → in the path field at top, remove the `mcp-server/` prefix → scroll down → "Commit changes".

Delete the `mcp-server/EXPORT-TO-PUBLIC-REPO.md` file (internal doc, not needed in public repo).

### Step 2 — Fix the Dockerfile typo

The file is currently named `mcp-server/Dockfile`. Either:
- Open it → pencil → rename path to `Dockerfile` (no `mcp-server/`, fix typo) → commit, OR
- Delete `mcp-server/Dockfile` and create a new file at root named `Dockerfile` with this content:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY tsconfig.json tsup.config.ts ./
COPY src ./src
RUN npm run build
CMD ["node", "dist/index.js"]
```

### Step 3 — Verify root layout

After all moves, `https://github.com/Browncabinet/yourechoagent-mcp` should show at the top level:

```
Dockerfile
LICENSE
README.md
CHANGELOG.md
glama.json
package.json
package-lock.json
tsconfig.json
tsup.config.ts
src/
```

The empty `mcp-server/` folder will disappear automatically once it has no files.

### Step 4 — Trigger Glama rebuild

On your Glama listing admin page, click **"Rebuild"** or **"Retry"**. With files at root and Dockerfile correctly named, the build will run `npm install` + `npm run build` and `dist/index.js` will exist when `CMD` runs.

## Notes

- I cannot edit your public repo directly — only you have write access. I'll prep any file contents you need pasted.
- After this works, tagging `v0.2.0` (Releases → Draft a new release) gives Glama a version to display.
