# Fix Glama "Cannot find module '/app/dist/index.js'"

## Diagnosis

The error means Glama ran `node dist/index.js` but `dist/` was never created. That happens when:
1. The `Dockerfile` skipped `npm install` + `npm run build`, OR
2. The build ran in the wrong directory (files are nested in `/mcp-server/` but Dockerfile copied from root), OR
3. The Dockerfile is still named `Dockfile` (typo) so Glama fell back to a default that just runs CMD.

Last time we checked, your public repo `yourechoagent-mcp` had files nested in `/mcp-server/` and a `Dockfile` (typo). We need one Dockerfile that works for that layout, no flattening required.

## The fix — replace your Dockerfile in the public repo

Step 1. Go to https://github.com/Browncabinet/yourechoagent-mcp

Step 2. If you see a file called `Dockfile` (no "er"), click it → pencil → rename to `Dockerfile` (filename field at top).

Step 3. If there is no `Dockerfile` at the **repo root** yet, click **Add file → Create new file**, name it exactly `Dockerfile` (capital D, no extension).

Step 4. Paste this **entire file** as the contents (works whether your code lives at root OR in `/mcp-server/`):

```dockerfile
FROM node:20-alpine
WORKDIR /app

# Copy everything from the repo
COPY . .

# Detect layout: if mcp-server/package.json exists, build there; otherwise build at root.
# Either way, the final dist/index.js ends up at /app/dist/index.js.
RUN if [ -f mcp-server/package.json ]; then \
      cd mcp-server && \
      npm install --include=dev --registry=https://registry.npmjs.org/ && \
      npm run build && \
      cp -r dist /app/dist && \
      cp -r node_modules /app/node_modules && \
      cp package.json /app/package.json ; \
    else \
      npm install --include=dev --registry=https://registry.npmjs.org/ && \
      npm run build ; \
    fi

ENV NODE_ENV=production
CMD ["node", "/app/dist/index.js"]
```

Step 5. Commit message: `Fix Dockerfile: install + build before CMD`. Click **Commit changes**.

Step 6. On Glama.ai → your server page → click **Rebuild** (or **Retry build**). Watch the logs — you should see `npm install`, then `tsup` building, then "Container started".

## Why this works

- `COPY . .` brings in every file regardless of layout.
- The `if` block handles both the current nested layout (`/mcp-server/`) and a future flat layout — so flattening the repo is no longer urgent.
- `npm install --include=dev` is required because `tsup` and `typescript` are devDependencies.
- The explicit `--registry=https://registry.npmjs.org/` bypasses any private mirror in a stray lockfile.
- `CMD ["node", "/app/dist/index.js"]` uses an absolute path so it doesn't matter what WORKDIR Glama assumes.

## After the rebuild succeeds

Tell me and I'll help you verify the listing shows the 10 tools and bump the version tag if needed.
