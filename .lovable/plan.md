## What's happening

Glama's automated reviewer is auto-generating a Dockerfile that clones your repo and runs `pnpm install && pnpm build` against the **entire Lovable web app** — then failing because pnpm's strict module resolution can't find `@tanstack/query-core` (a peer of `@tanstack/react-query`).

This is wrong on two levels:
1. Your MCP server is **remote/hosted** (Supabase edge function at `/functions/v1/mcp-http`). Glama should not be building anything — it should just register the remote URL.
2. Even if it did build, the Vite app build is irrelevant to the MCP server.

## Fix

Two changes, both in this repo, then push to GitHub and trigger a rescan.

### 1. Make `glama.json` unambiguously remote-only
Some Glama reviewers still attempt a build when they see `package.json` at root. Add explicit signals so they skip the build path:
- Keep the existing `remote.url` + `remote.transport`
- Add `"runtime": "remote"` at top level
- Add `"installation": { "type": "remote" }` so the reviewer doesn't try Docker
- Move build-related metadata out

### 2. Add `@tanstack/query-core` as an explicit dependency
Safety net in case Glama still tries to build. pnpm's strict hoisting hides the transitive peer; adding it explicitly resolves the Rollup "failed to resolve import" error.

```json
"@tanstack/query-core": "^5.83.0",
```

### 3. Republish + push to GitHub

After Lovable publishes and the changes are pushed to `Browncabinet/Your-Echo-Agent`, go to your server page on glama.ai and click "Re-review" (or wait for auto-retry). The reviewer should detect the remote endpoint and skip the Docker build entirely.

## If Glama still tries to build

Fallback: add a top-level `Dockerfile` that is a no-op (just declares the remote URL) — this overrides the auto-generated one. We'll only do this if step 1+2 don't clear the review.