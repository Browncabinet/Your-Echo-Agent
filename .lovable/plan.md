## Issue

The Dockerfile release now builds successfully on Glama, but Glama shows:

```
This server cannot be installed
```

This is a separate problem from the Dockerfile build. Glama's "Install" button needs an **install manifest** describing how end users run the server in their MCP client (Claude Desktop, Cursor, etc.). Our current `glama.json` only has:

```json
{ "$schema": "...", "maintainers": ["Browncabinet"] }
```

There is no `install` block, no env schema, and no npm/stdio entrypoint declared — so Glama has nothing to generate an install snippet from, and marks the server uninstallable.

## Plan

1. Expand `glama.json` to a full Glama server manifest with:
   - `name`, `description`, `homepage`, `repository`, `license`
   - `install` block describing the stdio launch:
     - `command`: `npx`
     - `args`: `["-y", "@browncabinet/yourechoagent-mcp"]`
   - `env` schema declaring `ECHO_API_KEY` as a required secret, with placeholder `eak_your_key_here` and a link to get one
   - Optional `ECHO_API_BASE` as non-required
   - `transports`: `["stdio"]`
   - `tools` summary (6 tools already in `public/.well-known/mcp/server-card.json`)

2. Leave the Dockerfile and `package.json` start scripts alone — they work now.

3. Note: the npm package `@browncabinet/yourechoagent-mcp` must actually be published for the `npx -y` install to succeed for end users. If it has not been published yet, Glama installs will fail with "package not found" even after the manifest is fixed. The `.github/workflows/publish-mcp.yml` workflow publishes on tag `mcp-v*`. You will need to push a tag like `mcp-v0.1.0` (and have `NPM_TOKEN` set in the repo secrets) to publish.

4. After committing the new `glama.json`, sync GitHub and click "Re-scan" / "Refresh" on the Glama server page. The Install button should populate with the npx command and the `ECHO_API_KEY` field.

## Technical details

New `glama.json` shape (Glama's schema):

```json
{
  "$schema": "https://glama.ai/mcp/schemas/server.json",
  "maintainers": ["Browncabinet"],
  "name": "yourechoagent-mcp",
  "description": "Hire autonomous outreach agents from any MCP-compatible LLM.",
  "homepage": "https://yourechoagent.com",
  "repository": "https://github.com/Browncabinet/Your-Echo-Agent",
  "license": "MIT",
  "transports": ["stdio"],
  "install": {
    "command": "npx",
    "args": ["-y", "@browncabinet/yourechoagent-mcp"]
  },
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

## Open question

Has `@browncabinet/yourechoagent-mcp` been published to npm yet? If not, I can also update the plan to walk through publishing it (push `mcp-v0.1.0` tag, confirm `NPM_TOKEN` secret is set) before re-testing the Glama install.
