## Goal
Add a **Test connection** button on `/settings/mcp` that pings the entered MCP endpoint URL and reports whether it's reachable.

## How the check works
Send a standard MCP `initialize` JSON-RPC request over Streamable HTTP directly from the browser to the URL currently in the input (no need to save first). Report one of:

- **Reachable** — HTTP 200 and a valid JSON-RPC response with a `result` (shows server name + protocol version if present, plus latency in ms).
- **Reachable, but not an MCP server** — HTTP 200 with a non-MCP body, or a JSON-RPC error.
- **Unreachable** — network error, CORS block, non-2xx status, or timeout. Show the status code / error message.

Request shape:
- `POST <url>`
- Headers: `Content-Type: application/json`, `Accept: application/json, text/event-stream` (required by the MCP Streamable HTTP spec — servers reject requests without both).
- Body: `{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"echo-settings-test","version":"1.0.0"}}}`
- 8-second `AbortController` timeout.
- Handle both `application/json` and `text/event-stream` responses (parse first SSE `data:` frame for the latter).

## UI changes in `src/pages/SettingsMcp.tsx`
- Add a **Test connection** secondary button next to **Save endpoint**. Disabled while empty or already testing.
- Validate the URL with the existing `urlSchema` before firing; show inline error on invalid input.
- Show a status row under the input while/after testing: spinner → colored dot + one-line result (green reachable, amber reachable-but-not-MCP, red unreachable) with latency and, if available, the server's `name`/`version`.
- Testing is independent of Save — user can test before saving.

## Out of scope
- No new database columns, no backend edge function, no auth changes.
- No changes to the MCP server itself.
