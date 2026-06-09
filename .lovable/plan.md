## Pre-Publish Review

### What's already good
- All public routes return 200 (`/`, `/pricing`, `/for-agents`, `/for-agents/docs`, `/about`, `/privacy`, `/terms`, `/acceptable-use`, `/sitemap.xml`, `/robots.txt`)
- `index.html` source is clean (no "Lovable App" defaults — those still show on live because publish is stale)
- `public/og-image.png` and `public/.well-known/agent.json` exist locally — will resolve at publish
- Security scan: 0 findings
- Top-priority SEO findings (duplicate titles, missing JSON-LD, og:url) are already fixed in source — will resolve at publish

### Issues to fix before publishing

**1. Accessibility — `/auth` (homepage) has no `<main>` landmark**
`src/pages/Auth.tsx` uses `<div className="flex-1">` for the primary content wrapper. Replace with `<main className="flex-1">` so screen readers can skip to content. This fixes the `lighthouse:lighthouse_accessibility` finding.

**2. SEO — pages missing per-route `<Helmet>`**
These pages render but inherit the homepage title/description:
- `/about` — `src/pages/About.tsx`
- `/privacy` — `src/pages/Privacy.tsx`
- `/terms` — `src/pages/Terms.tsx`
- `/acceptable-use` — `src/pages/AcceptableUse.tsx`
- `/for-agents/register` — `src/pages/PartnerRegisterAgent.tsx`

Add `<SeoHead>` to each with a unique title (<60 chars), description (50–160 chars), and self-referencing canonical. Pattern already used in `Index.tsx`, `Pricing.tsx`, `ForAgents.tsx`, `ForAgentsDocs.tsx`.

**3. Dismiss N/A Supabase linter warnings**
- *Leaked Password Protection Disabled* — N/A; auth is Google OAuth only, no passwords exist.
- *Extension in Public schema* — pre-existing Lovable Cloud default; low risk, no action.

These stay as warnings in the linter but aren't blockers.

### Issues intentionally NOT fixed
- *Lighthouse LCP (low)* — would require image preload tuning; defer to post-launch optimization pass.
- *SEMrush MCP guide suggestion* — content marketing task, not a launch blocker.
- *Per-route og:title/og:description for social crawlers* — Helmet only updates head client-side, so LinkedIn/Slack/Facebook will always see the homepage og tags. Fixing this properly needs SSR; the current homepage og is acceptable for all routes at launch.

### After the fixes

Publish the app via the Publish button. That single action resolves:
- Stale duplicate `<title>Lovable App</title>` and `<meta description="Lovable Generated Project">` on live HTML
- 404 on `/og-image.png`
- 404 on `/.well-known/agent.json`
- All "marked fixed pending rescan" SEO findings

### Files to change
- `src/pages/Auth.tsx` — wrap `<div className="flex-1">` content in `<main>`
- `src/pages/About.tsx` — add `<SeoHead>`
- `src/pages/Privacy.tsx` — add `<SeoHead>`
- `src/pages/Terms.tsx` — add `<SeoHead>`
- `src/pages/AcceptableUse.tsx` — add `<SeoHead>`
- `src/pages/PartnerRegisterAgent.tsx` — add `<SeoHead>`

Small, scoped, no business-logic changes. Then publish.
