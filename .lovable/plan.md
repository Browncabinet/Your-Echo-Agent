## Problem

`https://yourechoagent.com/.well-known/agent.json` returns **404**, even though `public/.well-known/agent.json` exists in the repo.

Cause: Lovable's static CDN does not serve files under dotfile-prefixed directories like `.well-known/` from `public/`. The file is in the build but the hosting layer rejects the path. (Confirmed: preview also doesn't serve it; production returns a real 404.)

## Fix

1. **Add a copy of the agent card at a non-dotfile path** so the CDN serves it:
   - Create `public/agent.json` with the same JSON content as `public/.well-known/agent.json`.
   - This will be reachable at `https://yourechoagent.com/agent.json`.

2. **Keep `public/.well-known/agent.json`** in the repo for spec compliance — if/when CDN behavior changes it will start working automatically.

3. **Submit the working URL to a2aregistry.org**: paste `https://yourechoagent.com/agent.json` into the **Well Known URI** field (the registry accepts any HTTPS URL returning a valid agent card; the field name is historical).

4. **Republish the frontend** so the new `agent.json` goes live (frontend changes require clicking Update in the publish dialog).

## Verification

After republish, `curl -I https://yourechoagent.com/agent.json` should return `200` with `content-type: application/json`.

No backend, schema, or component changes.