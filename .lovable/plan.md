You fixed the Dockerfile. The next step is to tell Glama to rebuild your server so it can verify the fix.

1. Go to your Glama.ai server page (the one that previously failed).
2. Click **"Rebuild"** (or **"Retry build"**).
3. Wait for the build to finish.

If it succeeds: your server becomes installable and you should get an approval email shortly.

If it fails again with the same `dist/index.js not found` error: the repo files might still be nested inside `/mcp-server/` instead of at the repo root. In that case, use GitHub's web UI to move `package.json`, `tsconfig.json`, `tsup.config.ts`, `src/`, and `glama.json` up to the root level (remove the `mcp-server/` prefix from their paths), then rebuild again.