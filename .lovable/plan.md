# Keeping your repo private on Glama

Glama's builder cloned your repo over anonymous HTTPS and failed:
`fatal: could not read Username for 'https://github.com'`
That means it has no GitHub credentials — it can only clone public repos unless you give it access. You have three realistic options.

## Option A — Grant Glama access to the private repo (recommended)

In Glama's server settings, look for a **"Connect GitHub"** / **"Install GitHub App"** / **"Add deploy key"** button. One of these will be offered:

1. **GitHub App install** — install Glama's app on your GitHub account and grant it access to *only* `Browncabinet/Your-Echo-Agent`. Nothing else is exposed.
2. **Deploy key** — Glama shows a public SSH key; you add it as a read-only deploy key under `Settings → Deploy keys` on the repo. Change the repo URL in Glama to the SSH form: `git@github.com:Browncabinet/Your-Echo-Agent.git`.
3. **Personal Access Token (fine-grained)** — create a fine-grained PAT scoped to just that one repo with `Contents: Read`, and paste it into Glama. Use the URL form `https://<token>@github.com/Browncabinet/Your-Echo-Agent.git`.

Your source stays private on GitHub; only Glama's build sandbox can pull it.

## Option B — Publish only a compiled/minified artifact

Create a second public repo (e.g. `yourechoagent-mcp-dist`) that contains only:

- `package.json` (runtime deps only)
- `dist/` (already-built, minified JS)
- `Dockerfile` that just runs `node dist/index.js`

No TypeScript sources, no prompts, no business logic in readable form. Point Glama at that repo. Developers can see the compiled output but not your source. This is the same pattern npm packages use.

## Option C — Host the MCP server yourself, register only the URL

If Glama supports "remote MCP server" (HTTP/SSE transport) instead of "build from source", you deploy the server on your own infra (Fly.io, Railway, a VPS) and give Glama just the endpoint URL + auth header. Nothing is ever cloned or built by Glama. Best privacy, requires you to run the server.

## What I recommend

Try **Option A** first — it's what Glama is designed for and takes ~2 minutes. If Glama's UI doesn't expose any GitHub auth field, fall back to **Option B**.

## Note on protection

None of these stop a determined user from reverse-engineering the running server's behavior (prompts can leak through outputs, API responses can be inspected). If prompts/logic are the crown jewels, keep the sensitive parts server-side behind your API (Option C) rather than shipping them inside the MCP server binary.

Reply with which option you want and I'll walk you through the exact steps.
