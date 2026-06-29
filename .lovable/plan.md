# Get straight A's on Glama

Glama's quality score grades 6 dimensions. Here's the focused plan to push each one to A.

## Glama's scoring rubric (and where you stand)

| Dimension | What it checks | Likely grade now | Target |
|---|---|---|---|
| **Utility** | Tools are useful, documented, real | A | A |
| **Reliability** | Server installs cleanly, no crashes | B | A |
| **Safety** | License, no telemetry surprises, secret handling | A | A |
| **Documentation** | README quality, examples, env vars | A- | A+ |
| **Maintenance** | Recent commits, releases, version tags | C | A |
| **Adoption** | Installs, GitHub stars, ratings | D | B+ |

## Changes to ship (in `yourechoagent-mcp` public repo)

### 1. Reliability → A
- Add a **CI workflow** (`.github/workflows/ci.yml`) that runs `npm install && npm run build` on every push so Glama sees a green check.
- Add a **smoke test** script (`npm test`) that boots the server, lists tools, and exits 0.
- Pin Node engine in `package.json` (`"engines": { "node": ">=18" }`).

### 2. Documentation → A+
- Add an **animated terminal demo** GIF/SVG to the top of the README (Glama scrapes the first image).
- Add a **"Why use this?"** 3-bullet section above Features.
- Add a **Security** section explaining the HMAC webhook signing and that the demo tier never touches your account.
- Add a **CONTRIBUTING.md** and **CODE_OF_CONDUCT.md** (Glama checks for both).
- Add an **examples/** folder with 2–3 ready-to-run prompts as `.md` files.

### 3. Maintenance → A
- Push a **v0.2.1** tagged release with a clear changelog entry (Glama rewards recent releases within 30 days).
- Add a **GitHub Releases** workflow that auto-tags from `package.json` version bumps.
- Add **`SECURITY.md`** with a vuln disclosure email.
- Add a **GitHub Actions badge** to the README.

### 4. Adoption → B+ (the slow one)
- Add a **Twitter/X share card** to README ("Tweet about Echo Agent MCP" link).
- Add a **"Used by"** section (even 1–2 logos helps).
- Encourage 5 friendly users to rate on Glama (1-click).
- Add `keywords` array to `package.json` so npm search surfaces it.

### 5. Glama-specific polish
- Add **`server.json`** at root (Glama's preferred manifest, more detailed than `glama.json`) with full tool schemas inlined.
- Add a **logo.png** (512×512) at repo root — Glama uses it as the avatar.
- Make sure the **`glama.json` description** is under 200 chars (current one is too long and gets truncated).

---

## What I'll do vs what you do

**I'll prepare (in this repo, then you copy to public repo via GitHub web UI):**
- `docs/public-repo-root-files/.github/workflows/ci.yml`
- `docs/public-repo-root-files/CONTRIBUTING.md`
- `docs/public-repo-root-files/SECURITY.md`
- `docs/public-repo-root-files/CODE_OF_CONDUCT.md`
- Updated `docs/public-repo-root-files/README.md` (shorter description, demo GIF placeholder, badges)
- Updated `docs/public-repo-root-files/glama.json` (trimmed description, added categories)
- `docs/public-repo-root-files/server.json` (Glama's richer manifest)
- `docs/public-repo-root-files/CHECKLIST-A-GRADE.md` — your copy-paste upload order

**You do (browser-only, 15 min total):**
1. Drag-drop the new files into `github.com/Browncabinet/yourechoagent-mcp` via web UI
2. Cut a **v0.2.1** release
3. Wait 24–48 h for Glama to re-scan
4. Ping 3–5 friendly testers to install + rate

## Approve and I'll generate every file ready to paste.
