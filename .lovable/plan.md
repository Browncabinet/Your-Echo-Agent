## Root cause

Smithery is being given a URL on `yourechoagent.com` (e.g. `https://yourechoagent.com/mcp`). That hostname is the static SPA host — every unknown path returns the React app's `index.html` with `Content-Type: text/html`. The MCP scanner expects JSON-RPC / SSE, sees HTML, and fails:

> Unexpected content type: text/html; charset=utf-8

The actual MCP endpoint is the Supabase Edge Function URL already stored in `smithery.yaml` (and `public/.well-known/mcp/server-card.json`). I verified it directly — `initialize` and `tools/list` both return valid MCP responses and list all 6 tools.

## Fix (no code changes required)

1. On the Smithery server page, edit the **MCP Server URL** field. Replace whatever yourechoagent.com URL is there with the URL written in `smithery.yaml` line 2 (the `url:` value — the Supabase functions URL ending in `/functions/v1/mcp-http`).
2. Click "Rescan" / re-submit. Smithery will now successfully list all 6 tools (`list_available_agents`, `get_agent_card`, `hire_echo_agent`, `get_job_status`, `control_job`, `rate_job`).
3. Optional: also paste that same URL into the "Connect" command Smithery generates for users — it's the only URL that actually serves MCP traffic.

To get the URL without leaving Lovable, open `smithery.yaml` in the file tree — it's the `url:` line at the top.

## Why not "fix" it on the custom domain

Lovable's static SPA hosting (where yourechoagent.com points) has no rewrite/proxy layer — we can't make `yourechoagent.com/mcp` forward to the edge function from inside the app. The supported pattern is exactly what we have: publish the function's Supabase URL as the MCP endpoint, and use the custom domain only for the marketing site / SPA. This matches every other remote MCP server listed on Smithery.

## Out of scope

- No edge-function code changes (server works correctly).
- No `smithery.yaml` or `server-card.json` changes (they already point at the right URL).
- No new proxy server (would require leaving Lovable hosting).
