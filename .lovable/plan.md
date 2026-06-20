# Publish the MCP server to npm (manual route)

Since you have npm org access and admin on the GitHub repo, the fastest path is to publish directly from your laptop. No GitHub secrets needed.

## Steps you run in your Terminal

```bash
# 1. Make sure you're logged into the right npm account
npm whoami
# If not logged in:
npm login

# 2. Confirm you have publish rights to the scope
npm access list packages @browncabinet

# 3. Go to the MCP server folder inside your cloned repo
cd ~/path/to/Your-Echo-Agent/mcp-server
# (adjust path — wherever you cloned it)

# 4. Install deps and build
npm install
npm run build

# 5. Publish (scoped packages need --access public the first time)
npm publish --access public

# 6. Verify it's live
npm view @browncabinet/yourechoagent-mcp version
```

## What success looks like

- Step 5 prints `+ @browncabinet/yourechoagent-mcp@0.1.0`
- Step 6 returns `0.1.0`
- Glama's "Install" button now works for end users — `npx @browncabinet/yourechoagent-mcp` will resolve

## If something goes wrong

- **`404 Not Found` on `npm access list`** — the `@browncabinet` org doesn't exist yet on npm. Create it at https://www.npmjs.com/org/create (free for public packages).
- **`403 Forbidden` on publish** — your npm account isn't a member of the org with publish rights. Add yourself at npmjs.com → @browncabinet → Members.
- **`402 Payment Required`** — you forgot `--access public`. Scoped packages default to private (paid). Re-run with the flag.
- **`mcp-server` folder doesn't exist** — I'll need to check the repo structure; let me know and I'll look.

## Note on the GitHub Action route

Once this manual publish works, the GitHub Action (`.github/workflows/publish-mcp.yml`) is still useful for future releases — but you can set that up later when you want v0.1.1. No urgency.

## No file changes needed

This plan is entirely terminal commands you run locally. I'm not modifying any project files.
