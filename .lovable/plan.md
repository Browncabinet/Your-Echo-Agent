
# Community Radar — upgrade of /for-agents/discover

Turn the existing Discover surface into "Community Radar": paste a URL, pick a niche, and Echo Agent returns communities, events, newsletters, forums, and podcasts with a fit score, how-to-approach guidance, and an on-demand outreach email draft per opportunity.

## What ships

**1. URL-first onramp (new top-of-page card)**
- Input: website URL + niche picker (existing chip list). Audience/region become "auto-detect (edit)".
- New edge function `analyze-site-for-radar` scrapes the URL with Firecrawl (`formats: ['markdown','summary']`), sends to Gemini to infer: niche suggestion, target audience, positioning, 5–10 keywords, region hint. Prefills the search form; user can edit any field before running.
- If the user skips the URL, the current manual form still works unchanged.

**2. Two new opportunity kinds: `newsletter`, `forum`**
- Extend the `Kind` enum in `discover-communities` and add site hints:
  - newsletter: `site:substack.com`, `site:beehiiv.com`, `site:convertkit.com`, `site:buttondown.email`, `"newsletter" niche`
  - forum: `site:discourse.org`, `site:reddit.com`, `"forum" niche`, `site:news.ycombinator.com` (as reference)
- Gemini classifier prompt updated to include newsletter/forum, and to return an `engagement_hint` string (e.g. "12k subscribers", "active daily", "5k members") when detectable.
- Migration: no enum column exists in DB (kind is `text`), so only code + UI filter updates.

**3. "How to approach" per opportunity**
- Gemini returns `approach: "post" | "sponsor" | "speak" | "pitch" | "subscribe" | "comment"` and `approach_reason` (one sentence).
- Rendered as a small pill on each Discover card and included in Radar cards.
- New nullable columns on `discovered_opportunities`: `approach text`, `approach_reason text`, `engagement_hint text`.

**4. On-demand outreach email draft**
- New "Draft outreach email" button on each opportunity card (Discover + Radar).
- New edge function `radar-draft-outreach`:
  - Input: `opportunity_id`
  - Loads the opportunity + the user's saved profile/site summary (reuse what `analyze-site-for-radar` cached, or re-derive from `user_email_settings` if present)
  - Calls Gemini with a subject+body prompt tailored to `kind` and `approach` (sponsor pitch vs. speaker pitch vs. guest-post vs. comment intro)
  - Returns `{ subject, body }`; frontend shows an editable dialog with Copy / Save-to-Radar buttons. Not sent — matches your "assist, not automate" stance for social/PR outreach.
- Cost control: draft is generated only when the user clicks the button; result is cached on the opportunity row (`draft_subject`, `draft_body`, `draft_generated_at`) so re-opening is free.

**5. Rename + light rebrand on the Discover page**
- Page title, breadcrumb, and nav label: "Discover" → "Community Radar".
- Route `/for-agents/discover` kept (no breakage); add redirect from `/for-agents/community-radar` → same page for shareability.
- Filter chips gain "Newsletters" and "Forums".
- Small hero explainer above results: "Paste your site. We scan communities, events, newsletters, forums, and podcasts — and draft the first message."

## Files touched

- `supabase/functions/discover-communities/index.ts` — add `newsletter`/`forum` kinds + hints, extend Gemini schema (`approach`, `approach_reason`, `engagement_hint`), persist new columns.
- `supabase/functions/analyze-site-for-radar/index.ts` — NEW. Firecrawl scrape → Gemini → prefill JSON.
- `supabase/functions/radar-draft-outreach/index.ts` — NEW. Per-opportunity draft.
- `supabase/migrations/*` — add nullable columns to `discovered_opportunities`: `approach`, `approach_reason`, `engagement_hint`, `draft_subject`, `draft_body`, `draft_generated_at`.
- `src/pages/Discover.tsx` — URL onramp card, new kind chips, approach pill, "Draft outreach email" button + dialog, rename to Community Radar.
- `src/pages/MyRadar.tsx` — surface `approach` + draft button on saved items.
- `src/App.tsx` — add `/for-agents/community-radar` alias route.
- Nav label update wherever Discover appears (`PartnerShell`).
- `.lovable/mem/features/` — new memory doc for Community Radar.

## Out of scope (call out for later)

- Auto-sending emails from the draft (kept manual — matches existing LinkedIn assist-only pattern).
- Enrichment of newsletter/forum contact info (Hunter lookup) — can layer in later using existing `discover-enrich-contact` fn.
- Weekly cap changes — reuses existing `current_week_caps` (1 Discover run = 1 discovery, unchanged).

## Notes

- No new secrets needed (Firecrawl + Lovable AI already wired).
- Draft function counts as an AI call but not a "discovery"; no cap change proposed. If cost becomes an issue we can add a per-week draft cap later.
- Keeps existing glassmorphism / DM Sans style; no new visual system.
