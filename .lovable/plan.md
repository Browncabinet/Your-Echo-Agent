## Reuse your existing npm token — skip to step 2

You already have an npm token, so no need to create a new one. Pick up here:

### 1. Add the token to your GitHub repo
- Go to: https://github.com/Browncabinet/Your-Echo-Agent/settings/secrets/actions
- Click **New repository secret**
- Name: `NPM_TOKEN` (exact, case-sensitive)
- Value: paste your existing npm token
- Click **Add secret**

If a secret named `NPM_TOKEN` already exists, click it → **Update secret** and paste the token again to be safe.

Note: it must be an **Automation** token (or Classic with "Publish" scope). Granular tokens scoped to `@browncabinet` work too. If unsure, generate a fresh Automation token at https://www.npmjs.com/settings/[your-username]/tokens — old "read-only" tokens won't publish.

### 2. Make sure the `@browncabinet` npm org exists
- Visit: https://www.npmjs.com/org/browncabinet
- If it 404s, create it (free for public packages): https://www.npmjs.com/org/create → name `browncabinet`
- Confirm your npm user is a member with publish rights

### 3. Create the release tag (triggers auto-publish)
- Go to: https://github.com/Browncabinet/Your-Echo-Agent/releases/new
- **Choose a tag** → type `mcp-v0.1.0` → **Create new tag on publish**
- Title: `MCP server v0.1.0`
- Click **Publish release**

### 4. Watch the workflow
- https://github.com/Browncabinet/Your-Echo-Agent/actions
- Wait ~1–2 minutes for the "Publish MCP Server" job to go green

### 5. Verify
- https://www.npmjs.com/package/@browncabinet/yourechoagent-mcp should show version `0.1.0`

### 6. Submit to glama.ai
- https://glama.ai/mcp/servers/add
- Paste repo URL: `https://github.com/Browncabinet/Your-Echo-Agent`
- Glama reads your `glama.json` automatically

## If the workflow fails
Paste the red step's log here and I'll diagnose. Most common: token isn't Automation-type, or org doesn't exist yet.