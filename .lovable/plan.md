# Fix: Glama is ignoring your Dockerfile

## What the logs prove

Glama's build only ran **4 steps** — install node, install `mcp-proxy`, clone your repo, then immediately `node /app/dist/index.js`. It **never ran your Dockerfile** (no `npm install`, no `tsup` build, no Docker build stage in the logs).

That means Glama is using its **default stdio runner** instead of Docker. The default runner does `git clone` → `node dist/index.js` with zero build step — which is why `dist/` doesn't exist.

Glama only switches to Docker when the **`glama.json` at the repo root** explicitly says `runtime: docker`. Right now the public repo either has no `glama.json` at the root, or the one there doesn't set `runtime: docker`.

## The fix — add one file to the public repo root

In `https://github.com/Browncabinet/yourechoagent-mcp`:

1. Click **Add file → Create new file**
2. Filename: `glama.json` (at the repo root, NOT inside `mcp-server/`)
3. Paste this exactly:

```json
{
  "$schema": "https://glama.ai/mcp/schemas/server.json",
  "maintainers": ["Browncabinet"],
  "name": "yourechoagent-mcp",
  "description": "Discover events, conferences & communities in any niche, then draft outreach — for AI agents.",
  "homepage": "https://yourechoagent.com",
  "repository": "https://github.com/Browncabinet/yourechoagent-mcp",
  "license": "MIT",
  "transports": ["stdio"],
  "runtime": "docker",
  "dockerfile": "Dockerfile",
  "env": {
    "ECHO_API_KEY": {
      "description": "Echo Agent API key (prefix eak_). Get one at https://yourechoagent.com/for-agents/register",
      "required": true,
      "secret": true,
      "placeholder": "eak_your_key_here"
    },
    "ECHO_API_BASE": {
      "description": "Override API base URL (defaults to production).",
      "required": false
    }
  }
}
```

4. Commit message: `Add glama.json: use Docker runtime`
5. Commit.

## Then verify the Dockerfile is at the root too

Open the repo file list. You should see at the **top level** (not inside a folder):

- `Dockerfile` ✅
- `glama.json` ✅ (the one you just added)

If `Dockerfile` is still inside `mcp-server/`, click it → pencil → change the path field from `mcp-server/Dockerfile` to just `Dockerfile` → commit.

## Then rebuild on Glama

Glama page → **Rebuild**. New logs should now show:

```
[x/y] FROM node:20-alpine
[x/y] COPY . .
[x/y] RUN ... npm install ...
[x/y] RUN ... npm run build ...
```

That confirms Glama picked up Docker mode. If you see those lines and it still fails, send me the new log and I'll patch the Dockerfile.

## Why the previous attempts didn't help

The Dockerfile content was correct — Glama just wasn't reading it because nothing told it to switch off the default Node runner. `runtime: docker` in `glama.json` is the switch.
