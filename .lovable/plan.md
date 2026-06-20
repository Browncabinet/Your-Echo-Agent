## What's happening

Glama's reviewer is still auto-generating a Dockerfile and running `pnpm install && pnpm build` against the full Vite app, even though `glama.json` declares `runtime: "remote"`. The pnpm build fails on a transitive peer (`@tanstack/query-core`) inside the web app — which has nothing to do with the MCP server.

The remote-runtime hints aren't being respected, so we need to **override** the auto-generated Dockerfile with our own minimal one that does nothing but declare the remote endpoint. When Glama sees a `Dockerfile` at the repo root, it uses that instead of generating one.

## Fix

### 1. Add a no-op `Dockerfile` at repo root

A tiny image that exits successfully and documents the remote URL. Glama's build step passes; its runtime step is skipped because the server is remote.

```dockerfile
# Echo Agent MCP is a REMOTE server — no local build required.
# Endpoint: https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http
# Transport: streamable-http
# See glama.json for the remote configuration.
FROM alpine:3.20
LABEL org.opencontainers.image.title="yourechoagent-mcp"
LABEL org.opencontainers.image.description="Remote MCP server — hosted endpoint, no local install required."
LABEL org.opencontainers.image.source="https://github.com/Browncabinet/Your-Echo-Agent"
LABEL com.glama.mcp.runtime="remote"
LABEL com.glama.mcp.endpoint="https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http"
CMD ["echo", "Echo Agent MCP is a remote server. Configure your client with the URL in glama.json."]
```

### 2. Add `.dockerignore` so the build context stays tiny

```
*
!Dockerfile
!glama.json
!LICENSE
!README.md
```

This guarantees the image build can never accidentally pull in `package.json` and trigger pnpm.

### 3. Belt-and-suspenders update to `glama.json`

Add `"dockerfilePath": "./Dockerfile"` so the reviewer explicitly points at our file rather than generating one. Keep the existing `runtime: "remote"` and `installation.type: "remote"` fields.

### 4. Republish + re-review

Lovable publishes → GitHub syncs → on glama.ai click **Re-review**. The Docker build will succeed (it's a 5MB alpine image with one echo command), and the remote endpoint stays the source of truth for actual MCP traffic.

## If this still fails

The next escalation is opening a support ticket with Glama, because at that point their reviewer is ignoring both the `runtime: remote` declaration AND the user-provided Dockerfile, which would be a platform bug on their side. We'd attach the failing build log and link to `glama.json`.

## Files to change

- **new** `Dockerfile` — minimal alpine, no build steps
- **new** `.dockerignore` — exclude everything except metadata
- **edit** `glama.json` — add `dockerfilePath`
- **edit** `.lovable/plan.md` — update troubleshooting notes
