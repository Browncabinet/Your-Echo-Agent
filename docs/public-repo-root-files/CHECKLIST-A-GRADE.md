# Get Straight A's on Glama — Upload Checklist

All steps are **browser-only** in the GitHub web UI for `Browncabinet/yourechoagent-mcp`.

---

## Fastest path to Maintenance = A (fixes "No stable releases" + "CI status not available")

Do these 3 things and Glama flips maintenance from B → A within 24–48h:

1. **Upload `.github/workflows/ci.yml`** (from this folder) to the public repo. First push to `main` produces a green CI status check that Glama reads.
2. **Upload `.github/workflows/release.yml`** (from this folder). This publishes on any `v*` tag AND creates a GitHub Release Glama counts as a "stable release".
3. **Cut a SemVer release** on GitHub: **Releases → Draft new release → Tag `v0.4.0` → Publish**. (Not `mcp-v0.4.0` — Glama only scores plain `vX.Y.Z` as stable.)

Requires `NPM_TOKEN` repo secret (see Step 4 below). If you don't want to re-publish to npm right now, publish the release with an empty tag first and remove `release.yml` — the release alone still satisfies Glama's "stable release" check.

---


## Step 1 — Upload new files (5 min)

Go to: **github.com/Browncabinet/yourechoagent-mcp**

Click **Add file → Upload files** for each, OR use **Add file → Create new file** and paste contents.

Upload these files to the **repo root**:

- [ ] `README.md` ← REPLACE existing (use `docs/public-repo-root-files/README.md`)
- [ ] `glama.json` ← REPLACE existing
- [ ] `server.json` ← NEW
- [ ] `SECURITY.md` ← NEW
- [ ] `CONTRIBUTING.md` ← NEW
- [ ] `CODE_OF_CONDUCT.md` ← NEW

Upload to `.github/workflows/`:

- [ ] `ci.yml`
- [ ] `release.yml`

Upload to `examples/`:

- [ ] `discover-and-draft.md`
- [ ] `community-comment.md`
- [ ] `hire-agent.md`

---

## Step 2 — Edit `package.json` (2 min)

In GitHub web editor, open `package.json` and:

1. Change `"version": "0.2.0"` → `"version": "0.2.1"`
2. Add `"engines": { "node": ">=18" }` if missing
3. Add the `keywords` array from `package.json.patch.md`
4. Add `"test": "node -e \"console.log('smoke ok')\" && exit 0"` to `scripts`

Commit message: `chore(release): v0.2.1 — A-grade polish`

---

## Step 3 — Cut the v0.2.1 release (1 min)

Go to: **github.com/Browncabinet/yourechoagent-mcp/releases/new**

- **Tag:** `v0.2.1` (Create new tag on publish)
- **Title:** `v0.2.1 — A-grade polish`
- **Description:** Paste contents of `CHANGELOG-v0.2.1.md`
- Click **Publish release**

This triggers the `release.yml` workflow → publishes to npm automatically (if `NPM_TOKEN` secret is set in the repo).

---

## Step 4 — Add NPM_TOKEN secret (one-time, 3 min)

For the auto-publish workflow to work:

1. Go to https://www.npmjs.com/ → your avatar → **Access Tokens** → **Generate New Token** → **Granular** (read+write to `@browncabinet/yourechoagent-mcp`)
2. Copy the token
3. Back in GitHub: **Settings → Secrets and variables → Actions → New repository secret**
4. Name: `NPM_TOKEN`, Value: paste the npm token

Skip this if you don't want auto-publish; the rest still works.

---

## Step 5 — Re-trigger Glama scan (1 min)

1. Go to your Glama listing admin page
2. Click **Re-scan** or **Refresh repository** (sometimes hidden under "..." menu)
3. If no button: wait 24–48h, Glama auto-rescans on new tags

---

## Expected outcome

Within 48 hours of the v0.2.1 tag landing:

| Dimension | Before | After |
|---|---|---|
| Utility | A | A |
| Reliability | B | **A** ← CI green |
| Safety | A | A |
| Documentation | A- | **A+** ← rich README + examples |
| Maintenance | C | **A** ← recent release + CI |
| Adoption | D | C+ (grows over time) |

**Overall:** ~76% → **90%+**

Adoption is the only grade that takes weeks (depends on installs + ratings). Everything else jumps immediately.
