The repeat failure is likely not fixed by another Glama metadata tweak. Glama’s current `glama.json` schema only supports `maintainers`, so release behavior is controlled by the Dockerfile/admin build spec. The most suspicious issue in the repo is that `mcp-server/package-lock.json` points many packages at Lovable’s private npm mirror (`europe-west4-npm.pkg.dev/lovable-core-prod/...`), which Glama’s Docker builder cannot access. That can make `npm ci` fail or cause Glama to fall back to building the root Vite app.

Plan:

1. Replace the Docker install strategy
   - Update the root `Dockerfile` so it does not rely on `mcp-server/package-lock.json`.
   - Use npm’s public registry explicitly.
   - Run `npm install` from `mcp-server/package.json`, then `npm run build`, then prune dev dependencies.
   - Keep the final command as `node dist/index.js` so Glama can start and introspect the stdio MCP server.

2. Tighten `.dockerignore`
   - Keep only files needed for the Docker build.
   - Do not include the private-mirror lockfile in the Docker context.
   - Include `mcp-server/package.json`, `mcp-server/tsconfig.json`, `mcp-server/tsup.config.ts`, and `mcp-server/src/**`.

3. Add Glama-friendly environment docs to the image
   - Add Docker labels for title/description/source.
   - Add an `ECHO_API_KEY` placeholder env var in the Dockerfile so Glama’s admin form can map the required key, while the server still allows `tools/list` without a real key.

4. Keep `glama.json` minimal
   - Leave it as only `$schema` + `maintainers`, because the live schema rejects/ignores other fields.

5. Update release instructions
   - Update the Glama docs note to say: in Glama Dockerfile admin page, build from root `Dockerfile`; set required env var `ECHO_API_KEY`; deploy; then make release.

After this, the next Glama review/release should build using public npm, start the real MCP server, and pass tool introspection instead of trying to build the root website or using inaccessible package URLs.