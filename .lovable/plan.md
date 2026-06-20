## Goal
Add your new purple circles logo to the Glama.ai MCP server listing so it displays correctly instead of the old .webp version.

## How Glama reads logos
Glama auto-reads `glama.json` from your repo root. It supports an `iconUrl` field (public URL) or lets you upload a file during manual submission. Because your listing is auto-detected from the repo, the logo must live as a public URL inside `glama.json`.

## Plan

1. **Save the uploaded logo to the site**
   - Copy your uploaded `echo_agent_logo-4.png` into `public/echo-agent-logo.png`
   - Once published, it will be live at `https://yourechoagent.com/echo-agent-logo.png`

2. **Update `glama.json`**
   - Add `"iconUrl": "https://yourechoagent.com/echo-agent-logo.png"` so Glama picks it up on the next scan

3. **Update other discovery files (optional but recommended)**
   - Update `iconUrl` in `public/agent.json` and `public/.well-known/mcp/server-card.json` to the same new URL

4. **Republish**
   - Push the changes to your repo so Glama can re-scan

5. **Rescan on Glama**
   - Visit your server page on Glama and trigger a re-scan, or wait for the next auto-refresh

## Note on the old logo
Your existing Google Cloud Storage .webp URL is referenced in a few places. If you want everything consistent, we can swap all of them to the new PNG in the same pass.