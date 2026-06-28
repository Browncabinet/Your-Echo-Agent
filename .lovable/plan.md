# Keep main repo private, publish only the MCP server

## The problem
GitHub visibility is set at the **repository** level, not per-folder. A repo is either fully public or fully private — you cannot make `mcp-server/` public while the rest of `Your-Echo-Agent` stays private. Registries like Glama, Smithery, and npm also need a public URL they can crawl, so the MCP code has to live somewhere public.

## Recommended approach: two repos
1. **`Your-Echo-Agent`** (existing) → flip to **Private**. Holds the app, edge functions, IP, business logic.
2. **`yourechoagent-mcp`** (new) → **Public**. Holds only `mcp-server/` contents + LICENSE + README + `glama.json` + the publish workflow.

The hosted MCP endpoint (`mcp-http` Supabase edge function) stays in the private repo — that is fine because registries only need the *stdio package* source to be public; the HTTP server just needs a reachable URL.

Why not a submodule or subtree? Both work but add friction (you would have to remember to push the subtree on every MCP change, and Lovable's GitHub sync only manages the main repo). A standalone repo is simpler and is what npm/Glama expect anyway.

## What I will do in build mode
1. Generate a clean export of the current `mcp-server/` folder ready to drop into a new repo (with adjusted paths, root-level `package.json`, `LICENSE`, `README`, `glama.json`, `.github/workflows/publish.yml`).
2. Update the **private** repo: remove the `mcp-server/` subfolder, replace it with a short `mcp-server/README.md` pointer that links to the new public repo and npm package.
3. Update `glama.json`, `smithery.yaml`, `docs/registry-submissions.md`, and `docs/glama-submission-card.md` in the private repo to point to the new public repo URL.
4. Confirm the hosted Supabase function URL (used by Smithery) is unchanged.

## What you need to do (manual steps — GitHub side)
Lovable's GitHub integration only manages the connected repo, so the new public repo must be created by you.

```text
1. Make the main repo private
   GitHub → Browncabinet/Your-Echo-Agent → Settings → General
   → scroll to "Danger Zone" → Change repository visibility → Make private

2. Create the new public repo (empty, no README)
   GitHub → New repository
     Owner:        Browncabinet
     Name:         yourechoagent-mcp
     Visibility:   Public
     Initialize:   leave everything unchecked

3. Push the exported mcp-server folder I prepared
   On your machine:
     mkdir yourechoagent-mcp && cd yourechoagent-mcp
     # copy the contents of mcp-server/ from the private repo into here
     git init
     git add .
     git commit -m "Initial public MCP server"
     git branch -M main
     git remote add origin https://github.com/Browncabinet/yourechoagent-mcp.git
     git push -u origin main

4. (Optional) Add an npm publish token
   GitHub → yourechoagent-mcp → Settings → Secrets and variables → Actions
   → New repository secret → Name: NPM_TOKEN, Value: <token from npmjs.com>
```

## After the split — what is public vs private

```text
PUBLIC  github.com/Browncabinet/yourechoagent-mcp
        ├── src/             (stdio MCP client — proxies to hosted endpoint)
        ├── package.json     (published as @browncabinet/yourechoagent-mcp)
        ├── glama.json
        ├── LICENSE (MIT)
        └── README.md

PUBLIC  yourechoagent.com + Supabase edge function /mcp-http
        (the hosted server Smithery talks to — URL only, no source visible)

PRIVATE github.com/Browncabinet/Your-Echo-Agent
        ├── src/             (React app, business logic)
        ├── supabase/        (all edge functions including mcp-http source)
        └── docs/            (internal docs)
```

## Trade-offs to be aware of
- **Two sync points.** Changes to MCP tool definitions must be made in both repos (private `mcp-http` edge function + public stdio client). I will keep them in lockstep when you ask for tool changes.
- **Glama re-submission.** The Glama listing currently points at `Your-Echo-Agent`. Once that goes private, Glama will fail its next re-scan ("repository not found"). You will need to edit the listing's repo URL to the new public repo — I will include the exact steps after the new repo exists.
- **Smithery is unaffected** — it points at the hosted Supabase URL, not GitHub.

## Alternative (only if you want one repo)
Keep `Your-Echo-Agent` **public** and rely on the fact that secrets, API keys, and customer data already live in Supabase (not in the repo). This is how most SaaS-on-Lovable projects ship. Your actual "IP" is the prompts, the discovery pipeline, and your customer base — not the React code. Say the word if you want to go this route instead and skip the split.
