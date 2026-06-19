# Your Echo Agent

Autonomous outreach agents that launch personalized cold email and LinkedIn campaigns. Live at [yourechoagent.com](https://yourechoagent.com).

## MCP Server

This repo also ships an MCP server so any MCP-compatible LLM (Claude, Cursor, etc.) can hire Echo agents directly. See [`mcp-server/README.md`](./mcp-server/README.md) for install and usage.

- Package: `@browncabinet/yourechoagent-mcp` on npm
- Manifest: [`glama.json`](./glama.json)
- Source: [`mcp-server/`](./mcp-server)

## Releasing the MCP server

Tag a release with the `mcp-v*` prefix and GitHub Actions will build and publish to npm:

```bash
git tag mcp-v0.1.1
git push origin mcp-v0.1.1
```

Requires `NPM_TOKEN` repo secret (GitHub → Settings → Secrets and variables → Actions).
