# Fix Glama build config

## Root cause

1. **Transient**: Glama's builder timed out pulling `debian:trixie-slim` from Docker Hub ("context deadline exceeded"). Retrying the build should clear this — nothing in your repo caused it.
2. **Real config bugs** that will fail the next build anyway:
   - Config uses `pnpm`, but the repo ships `mcp-server/package-lock.json` (npm), no `pnpm-lock.yaml`.
   - Build/start scripts live in `mcp-server/`, not repo root. `pnpm run build` at `/app` will error with "Missing script: build".
   - `mcp-proxy` wraps stdio servers to expose them over HTTP. Glama runs stdio natively — wrapping it breaks tool discovery. Your existing `Dockerfile` at repo root already builds correctly without it.
   - Python 3.14 + `uv` install are unused (the MCP server is pure Node).

## Fix (Glama "Docker configuration" form)

Update these fields on the Glama server edit page:

| Field | New value |
|---|---|
| Base image | `node:20-alpine` (matches your committed `Dockerfile`) |
| Node version | `20` |
| Python version | *(clear — not needed)* |
| Build steps | `cd mcp-server && npm install && npm run build` |
| Cmd arguments | `["node", "mcp-server/dist/index.js"]` |
| Placeholder args | keep `ECHO_API_KEY=eak_your_key_here` |
| Pinned commit | leave `null` (use latest `main`) |

Equivalent JSON:

```json
{
  "baseImage": "node:20-alpine",
  "buildSteps": [
    "cd mcp-server && npm install && npm run build"
  ],
  "cmdArguments": ["node", "mcp-server/dist/index.js"],
  "nodeVersion": "20",
  "pythonVersion": null,
  "pinnedCommit": null,
  "placeholderArguments": { "ECHO_API_KEY": "eak_your_key_here" }
}
```

## Even simpler alternative (recommended)

Delete the custom Docker configuration entirely and let Glama use the **`Dockerfile` already committed at the repo root**. It's already correct: `node:20-alpine`, builds `mcp-server/`, runs `node dist/index.js` over stdio. Custom build steps only exist to override that Dockerfile — you don't need to.

## After saving

Click **Rebuild**. If it fails again with the same `debian:trixie-slim` / "context deadline exceeded" error, that's still Glama's Docker Hub outage — wait a few minutes and retry. No repo changes needed for that.

## No code changes in this repo

This plan is entirely configuration on glama.ai. Nothing in the Lovable project needs to change.
