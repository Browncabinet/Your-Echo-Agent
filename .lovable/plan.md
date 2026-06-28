
# Repositioning: Event Discovery + AI Outreach

The site currently sends every visitor at `/` to `/for-agents`, which is a developer/A2A page. The new positioning needs a **real consumer homepage** that leads with event & community discovery, while keeping `/for-agents` as the sharp A2A landing for Glama.ai traffic.

I'll ship this in **two passes**. Pass 1 (this turn, after you approve) covers Homepage + Discover positioning + SEO. Pass 2 (next turn) covers For Agents sharpening, trust/social proof scaffolding, and CTAs.

---

## Pass 1 — Homepage + Discover focus + SEO

### 1. New `src/pages/Home.tsx` (consumer landing)

Sections, top to bottom:

- **Hero** — H1: *"Find where your audience gathers. Turn it into pipeline."* Sub: *"AI-powered event & community discovery + personalized outreach. Discover conferences, webinars, podcasts, and groups in your niche — then send hyper-personalized emails. No LinkedIn scraping."* CTAs: **Start free — 50 emails** / **See how it works**.
- **"Why we changed" banner** — Three-up: *Relationship-first · Higher-quality leads · Sustainable & TOS-safe*. One short paragraph explaining the pivot away from LinkedIn scraping.
- **Hero feature: Events & Communities Discovery** — Visual mock of the Discover flow with 4 labelled steps: *Niche → Discover (Groups, Conferences, Webinars, Podcasts) → AI fit score → One-click actions (Draft comment, Email, Add to calendar, Save to Radar)*. Built with Tailwind + lucide icons + framer-motion fades. CTA: **Try Discover →** (deep-links signed-in users to `/for-agents/discover`, others to signup).
- **Supporting features grid** — *AI Email Builder · Reply Handler · MCP / A2A for agents*. Each card 2-3 lines + link.
- **Example niches strip** — Chip row: *Fractional CFOs · DTC founders · Climate-tech · Indie SaaS · B2B agencies · Real-estate investors · Podcasters · Local services*. Sets expectations.
- **Trust / Social-proof placeholders** — Three testimonial cards with placeholder quotes + "Add your story" CTA, plus two mini case-study cards (*"Booked 11 podcast guests in 30 days"*, *"3 enterprise demos from one conference"*).
- **Pricing teaser** — Reuse existing `HomePricingSection` if importable; otherwise a 3-card row linking to `/pricing`.
- **FAQ** — Reuse `FaqSection` with 2 new questions: *"Why no LinkedIn scraping?"* and *"How does event discovery work?"*.
- **Bottom CTA** — *"Start free — 50 emails. No credit card."*

### 2. Routing change in `src/App.tsx`

`HomeRoute` currently does `<Navigate to={user ? "/for-agents/dashboard" : "/for-agents"} />`. Change to:
- Signed-out → render `<Home />` (new public landing).
- Signed-in → keep redirect to `/for-agents/dashboard`.

### 3. SEO updates in `index.html`

- `<title>`: *Your Echo Agent — AI event discovery + outreach for conferences, webinars & communities*
- `<meta name="description">`: *Discover conferences, webinars, podcasts, and communities in your niche. AI drafts personalized outreach and triages replies. No LinkedIn scraping. 50 free emails.*
- Mirror in `og:*` and `twitter:*`.
- Rewrite the `SoftwareApplication` JSON-LD `description` + `featureList` to lead with event discovery (drop the LinkedIn mention).

### 4. Discover page polish (`src/pages/Discover.tsx`)

- Add a one-line "How it works" strip above the Search card (4 numbered steps).
- Update `SeoHead` title to *"AI event & community discovery for your niche — Your Echo Agent"*.

### 5. Mobile

All new components built mobile-first with Tailwind (`grid-cols-1 md:grid-cols-3`, stacked CTAs, no horizontal scroll). Verified visually via the preview.

---

## Pass 2 (next turn, after you approve Pass 1)

- **For Agents page** — Replace hero copy with *"Hire Echo Agents to run event-driven outreach campaigns"*; add an "Event-driven campaign" API example (`hire` payload with `campaign_type: "event_discovery"`); add a "Discovered on Glama.ai" badge row.
- **Campaign Wizard toggle** — Currently there is no `CampaignWizard` component in the repo (Discover is its own page). I will either (a) add a "Mode" toggle on Discover (*Event-driven* default · *Smart Search* · *Paste URL*) that swaps the search form, or (b) skip if you confirm the existing 3 entry points are enough. **Question for you below.**
- **CTA wiring** — Add subtle "Upgrade to discover 5× more events" CTAs in Discover when cap is hit, linking to `/pricing`.
- **Testimonial collection** — Convert the placeholder cards into a `testimonials` table + admin form so you can add real ones without code edits. Defer if you want HTML-only for now.

---

## Out of scope (flagging, not building unless you ask)

- Animated/Lottie demo video — I'll use static stepped visuals + framer-motion fades; a real animated demo needs a Loom/GIF asset from you.
- Real screenshots of the Discover UI — I'll style mocks that match the actual UI; if you want real screenshots, capture them and I'll swap.
- New blog/resources section on event marketing — good next step, but a separate build.
- Custom OG image — current one stays; ask if you want a new one generated.

---

## One question before I start Pass 1

Campaign Wizard: there's no wizard component today — Discover is its own page and the legacy "Smart Search / Paste URL" flows live elsewhere in the dashboard. Do you want me to:

1. **Add a mode toggle on Discover** (*Event-driven* default, *Smart Search*, *Paste URL*) so all three lead-gen modes are reachable from one page, OR
2. **Leave navigation as-is** (Discover, Smart Search, Paste URL as separate items) and just make Discover the most prominent?

If you don't answer, I'll go with **#2** (less churn, ships faster).
