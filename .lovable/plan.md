
# Why the suggested fix won't work

The notes you pasted assume Smithery is failing because the MCP code lives in `/mcp-server/`. That's not the actual cause, and moving files would not change Smithery's behavior.

Two different registries, two different transports:

| Registry | How it loads the server | Cares about repo layout? |
|---|---|---|
| **Smithery** | Remote HTTP scan of the URL you paste into the form | No — never reads the repo |
| **Glama** | Reads `glama.json`, installs the npm package `@browncabinet/yourechoagent-mcp` | Yes, but `"path": "mcp-server"` already tells it where to look — this is working as designed |

Smithery's error `Unexpected content type: text/html` means its scanner hit a URL that returned an HTML page (our React SPA) instead of the MCP JSON-RPC endpoint. That happens when the URL field on Smithery is set to something like `https://yourechoagent.com/...` instead of the actual edge function URL.

The repo layout has nothing to do with it. Even if we moved every file to root, Smithery would still get HTML back from whatever wrong URL is in that field.

# Real fix (no code changes)

On the Smithery server page → **MCP Server URL** field, paste exactly:

```
https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http
```

Then click Rescan. The 6 tools will appear. This is the same URL already published in `public/.well-known/mcp/server-card.json` and `smithery.yaml`, and it's been verified to return a valid MCP `initialize` + `tools/list` response.

# Why we shouldn't do the proposed moves

1. **Moving `/mcp-server/` to root** would break:
   - The npm package (`mcp-server/package.json` is what gets published as `@browncabinet/yourechoagent-mcp`)
   - The GitHub Action `.github/workflows/publish-mcp.yml` (uses `working-directory: mcp-server`)
   - Glama's existing working config
   - The Lovable project itself (root is a Vite app, not a Node MCP server — two `package.json` files at root would collide)

2. **The `server.js` shim** wouldn't help either. It's a stdio entry point; Smithery is a remote HTTP scanner. Stdio entry points are irrelevant to it. Glama already handles stdio correctly via the npm package.

3. **`entryPoint` in `glama.json`** isn't part of Glama's schema (`path` + the npm `bin` field is what they use). Adding it would be ignored at best, rejected at worst.

# What I'd like to do in build mode

Nothing in the code. Just confirm the URL fix above resolves Smithery, then (optionally) I can add a one-line note to `docs/registry-submissions.md` reminding future-you that the Smithery URL field must be the `…supabase.co/functions/v1/mcp-http` endpoint, never the marketing domain.

# Question for you

Can you check the Smithery form and tell me what's currently pasted in the **MCP Server URL** field? If it's anything other than the `…/functions/v1/mcp-http` URL above, that's the bug — and the fix is a 5-second edit on Smithery, not in our repo.
