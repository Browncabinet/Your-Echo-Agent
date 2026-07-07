# Fix Glama Maintenance Grade (B → A)

Glama's maintenance scorecard shows two gaps on the public repo `Browncabinet/yourechoagent-mcp`:

1. **No stable releases found** — Glama looks for SemVer GitHub Releases (e.g. `v0.4.0`) on the public repo. Your current tag scheme is `mcp-v*` (from `.github/workflows/publish-mcp.yml`), which Glama does not recognize as a stable release. The npm package is at `0.4.0` but no matching GitHub Release exists on the public repo.
2. **CI status not available** — the public repo has no CI workflow producing a visible status badge/check. The `ci.yml` file exists only under `docs/public-repo-root-files/.github/workflows/ci.yml` in this project and has never been pushed to the public MCP repo.

Everything else in the maintenance section is already green (commits, vulns, code scanning).

## What to change

All changes happen in **this** repo, then get copied/pushed to the public MCP repo `Browncabinet/yourechoagent-mcp`. No app/UI code changes.

### 1. Add a real CI workflow to the public repo
Publish a `.github/workflows/ci.yml` at the **root of the public MCP repo** that:
- Runs on push + PR to `main`
- Sets up Node 20, `npm ci` inside `mcp-server/`, `npm run build`, `npm test --if-present`
- Uploads a status check GitHub (and Glama) can read

The file already exists as a template at `docs/public-repo-root-files/.github/workflows/ci.yml`. We'll refine it to `cd mcp-server` so it actually builds the server, and add it to the checklist for upload.

### 2. Cut a SemVer GitHub Release on the public repo
Glama wants `v<major>.<minor>.<patch>` releases. Two options — pick one in the plan:

- **Option A (recommended):** Add a second workflow trigger so `v*` tags also publish. Then tag `v0.4.0` on the public repo → GitHub Release is created → Glama sees a stable release.
- **Option B:** Keep `mcp-v*` for npm publishing but manually create a `v0.4.0` GitHub Release (no npm re-publish) purely for Glama's scorecard.

I'll go with **Option A** — one workflow, one tag scheme going forward, matches the `release.yml` template already drafted in `docs/public-repo-root-files/.github/workflows/release.yml`.

### 3. Update the upload checklist
Amend `docs/public-repo-root-files/CHECKLIST-A-GRADE.md` so the user knows exactly which files to drop into the public repo and which tag to cut to flip maintenance to A.

## Files to change (this repo)

- `docs/public-repo-root-files/.github/workflows/ci.yml` — add `working-directory: mcp-server` and `npm test --if-present`, keep matrix Node 18/20/22.
- `docs/public-repo-root-files/.github/workflows/release.yml` — already exists and correct; confirm it uses `mcp-server/` working dir.
- `docs/public-repo-root-files/CHECKLIST-A-GRADE.md` — add a short "Maintenance A" section with the 3 upload steps + tag command.

## What the user does after (one-time, ~5 min in GitHub web UI)

1. Upload `ci.yml` and `release.yml` to `.github/workflows/` on `Browncabinet/yourechoagent-mcp`.
2. Ensure `NPM_TOKEN` repo secret exists (already documented in the checklist).
3. Create release: **Releases → Draft new release → Tag `v0.4.0` → Publish**. This triggers `release.yml` and gives Glama both a stable release and a visible CI run.
4. Wait 24–48h for Glama re-scan (or click Re-scan in the Glama admin).

## Expected result

| Signal | Before | After |
|---|---|---|
| Stable releases | ❌ none | ✅ `v0.4.0` |
| CI status | ❌ unavailable | ✅ green check on `main` |
| Maintenance grade | B | **A** |

No changes to app code, UI, pricing, backend, or SEO.
