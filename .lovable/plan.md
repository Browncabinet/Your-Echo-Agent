## Glama install fix — Docker runtime

`glama.json` now uses the repo-root `Dockerfile` (`runtime: docker`) instead of `npx`. This works without the npm package being published, so Glama can build and run the stdio MCP server immediately.

### Re-trigger Glama
1. Go to your server's page on https://glama.ai/mcp/servers
2. Click **Re-scan** (or re-submit `https://github.com/Browncabinet/Your-Echo-Agent` at https://glama.ai/mcp/servers/add)
3. Glama pulls the updated `glama.json`, builds the Dockerfile, and the "cannot be installed" badge clears

### (Optional later) Publish to npm for `npx` users
Claude Desktop / Cursor / Windsurf users prefer `npx -y @browncabinet/yourechoagent-mcp`. To enable that path:
1. Add `NPM_TOKEN` at https://github.com/Browncabinet/Your-Echo-Agent/settings/secrets/actions
2. Create release tag `mcp-v0.1.0` at https://github.com/Browncabinet/Your-Echo-Agent/releases/new
3. GitHub Action publishes the package automatically
