
# Update descriptions sitewide

Positioning: **All-in-one outreach + discovery** — AI emails, event/community finder, and reply handling in one app.

## Master copy (used everywhere, trimmed per slot)

- **Tagline (≤60 chars):** Your Echo Agent — outreach + discovery, on autopilot.
- **Short meta (≤155 chars):** AI outreach agent that finds leads, drafts personalized emails, discovers events and communities in your niche, and handles replies. 50 free emails.
- **Long blurb (~280 chars):** Your Echo Agent is an all-in-one AI outreach platform. Find verified leads, draft hyper-personalized emails, discover conferences, webinars, and groups in your niche, and let AI triage every reply — all from one dashboard. Start free with 50 emails.

## 1. SEO meta (`index.html`)

- `<title>`: Your Echo Agent — AI outreach + event discovery
- `<meta name="description">`: short meta above
- `og:title` / `og:description` / `twitter:*`: mirror the above
- Organization JSON-LD `description`: long blurb

## 2. Per-page titles & descriptions (react-helmet-async)

Helmet is already wired. Update `<Helmet>` blocks (or add where missing) on:

| Route | Title | Description |
|---|---|---|
| `/` | Your Echo Agent — AI outreach + event discovery | short meta |
| `/pricing` | Pricing — Your Echo Agent | Weekly plans from $19. Top-ups never expire. 50 free emails to start. |
| `/for-agents` | For AI Agents & MCP — Your Echo Agent | Hosted MCP server + A2A endpoints so agents can run outreach, discovery, and reply handling on behalf of users. |
| `/discover` | Discover events & communities — Your Echo Agent | Find conferences, webinars, podcasts, and groups in your niche. Save to Radar, draft comments, extract contacts. |
| `/my-radar` | My Radar — Your Echo Agent | Your saved events, webinars, and communities with one-click calendar add. |
| `/about` | About — Your Echo Agent | Built by a solo founder to replace LinkedIn-only outreach with smarter discovery + AI email. |
| `/privacy`, `/terms`, `/acceptable-use` | Legal — Your Echo Agent | Standard legal short descriptions. |

Each Helmet block also sets self-referencing `canonical` and `og:url`.

## 3. Home hero & section copy (`src/pages/Home.tsx` or equivalent)

- **Hero H1:** Outreach + discovery, on autopilot.
- **Hero sub:** Find leads, draft personalized emails, discover conferences and communities in your niche, and let AI handle replies — all in one place.
- **Primary CTA:** Start free — 50 emails
- **Three-up feature blurbs:**
  - *Smart outreach* — AI drafts that sound like you, sent at safe deliverability limits.
  - *Discover* — Surface conferences, webinars, podcasts, and groups matched to your niche.
  - *Reply handler* — Every reply classified, prioritized, and pre-drafted.
- **Comparison-table intro:** Why settle for a LinkedIn-only tool? Echo does outreach, discovery, and replies together.

## 4. Registry / marketplace blurbs

Same long blurb (trimmed per limit) in:

- `glama.json` — `description`
- `smithery.yaml` — `description`
- `public/.well-known/mcp/server-card.json` — `description`
- `public/agent.json` — `description`
- `docs/glama-submission-card.md` — short + long blurbs refreshed
- `README.md` — top-of-file tagline + intro paragraph

## Technical notes

- All edits are presentation-layer (HTML, JSX strings, JSON metadata). No schema, routing, or business-logic changes.
- Helmet provider already mounted; no new deps.
- After publish, link previews on LinkedIn/Slack/X stay cached until those platforms re-scrape — use their debuggers to force refresh.
- Will mark related SEO findings fixed via `seo_chat--update_findings` after edits.

## Out of scope

- New og:image (ask separately if you want one generated).
- Content/blog pages.
- Visual redesign — copy only.
