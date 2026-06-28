# Events & Communities Discovery — Final Plan

New default **Lead Acquisition** mode that finds the *places* the audience gathers (groups, conferences, webinars, podcasts), scores fit, and turns each into an Attend / Comment / Email action. LinkedIn Assist, Smart Search, and Scrape-a-Page remain as secondary options.

## Flow

```text
{ niche, audience, region|virtual_only, timeframe (default 90d) }
        │
        ▼
[discover-communities]  (edge fn)
  ├─ Firecrawl searches across: Eventbrite, lu.ma (Luma), Meetup,
  │   Zoom events, Hopin, Sessionize, Cvent, ti.to,
  │   Reddit, Slack/Discord directories, LinkedIn Events, YouTube Live,
  │   Podchaser/Listen Notes, industry association sites
  ├─ Gemini classifies → Group | Conference | Webinar | Podcast
  ├─ Extracts: title, date(s), URL, host org, organizer/speaker hints, location/virtual
  ├─ Fit score 0–100 + 1-sentence "why it fits" (Gemini, audience-aware)
  └─ Dedup by normalized URL + (title+date) hash
        │
        ▼
[discover-extract-contacts] (on demand, per opportunity)
  Scrape page → pull organizer/speaker names + public emails/contact URLs
        │
        ▼
Per-card actions
  • Attend  → ICS download + in-app reminder (Google Cal OAuth = phase 2)
  • Comment → context-aware draft (platform auto-detected from URL)
  • Email   → reuses generate-emails, drops into existing sender
  • Save    → adds to "My Radar"
```

## UI

- **Campaign Wizard → Step 2 (Lead Acquisition)**: mode toggle with **Events & Communities** as new default for relationship-led niches.
  - Inputs: region picker (Global default) + "Virtual only" switch, timeframe (Next 90 days default; quick: Next 30 / Custom range), sort by soonest.
- **Campaign dashboard → new "Discover" page**, 4 tabs: Groups · Conferences · Webinars · Podcasts.
  - Cards show: title, date, location/virtual badge, **prominent Fit Score** with hover explanation, primary action button, secondary "Draft email/comment".
  - Small compliance footnote: "You are responsible for CAN-SPAM / GDPR compliance on any outreach you send."
- **My Radar** (saved items): calendar view + table view, status (Planned / Attended / Followed up / Dismissed), notes.
- **Comment composer** detects platform from URL and adapts tone:
  - LinkedIn → professional, insight-led
  - Reddit → community, helpful, no pitch
  - YouTube / event pages → enthusiastic, on-topic
  - Twitter/X → concise, conversational
  - Generic fallback for unknown hosts.

## Backend

### Edge functions (new)
- `discover-communities` — input `{ niche, audience, region, virtual_only, timeframe, kinds[] }`. Runs 4–6 targeted Firecrawl searches per requested kind (site:eventbrite.com, site:lu.ma, site:meetup.com, etc.), pipes results through Gemini for classify + fit-score + dedup, inserts into `discovered_opportunities`. Returns paginated results.
- `discover-extract-contacts` — input `{ opportunity_id }`. Scrapes the URL via `firecrawl-scrape`, extracts contacts with the `extract-leads` pattern, stores into `discovered_opportunities.contacts` jsonb.
- `discover-draft-comment` — input `{ opportunity_id, platform_hint? }`. Detects platform from URL, calls Gemini with platform-specific system prompt, returns draft.
- `discover-ics` — input `{ opportunity_id }`. Returns a downloadable `.ics` (also stored so reminders can fire).

### Reused (no changes)
- `generate-emails` for outreach drafts
- `firecrawl-search` / `firecrawl-scrape`
- `send-campaign-emails`, tracking, deliverability, unsubscribe
- Weekly caps via `weekly_usage` + `current_week_caps`

### Database (new tables, full GRANTs + RLS)
- `discovered_opportunities`
  - `id, user_id, campaign_id (nullable), kind (group|conference|webinar|podcast), title, url (unique per user), host_org, location, is_virtual, event_start, event_end, timezone, source, contacts jsonb, fit_score int, fit_reason text, dedup_hash, status (new|saved|dismissed), created_at, updated_at`
- `radar_items`
  - `id, user_id, opportunity_id (fk), action (attend|comment|email|other), due_date, reminder_at, notes, status (planned|done|skipped), created_at, updated_at`
- Add column `weekly_usage.discoveries_used int default 0` for cap tracking. Caps mirror LinkedIn (50 / 150 / 400) and are enforced in `discover-communities` via `current_week_caps`.

RLS: all rows scoped to `auth.uid() = user_id`. GRANT `SELECT, INSERT, UPDATE, DELETE` to `authenticated`; `ALL` to `service_role`. No `anon`.

## Build order

1. Migration: new tables + `weekly_usage.discoveries_used` column + RLS + GRANTs.
2. Edge functions: `discover-communities`, `discover-extract-contacts`, `discover-draft-comment`, `discover-ics`.
3. Update `current_week_caps` returning `discoveries_cap` / `discoveries_used`.
4. Wizard toggle + Discover page (4 tabs, cards, fit score, actions, compliance note).
5. My Radar (table + calendar).
6. QA: caps enforcement, dedup, platform detection on comment drafts, ICS validity.

## Deferred to phase 2

- Google Calendar OAuth integration for "Attend" (ICS first).
- Auto-suggested follow-up sequence after an attended event.
- Per-platform comment quality A/B testing.

## Open questions (non-blocking, can default if no reply)

1. Should `discoveries_used` share the LinkedIn cap bucket or be a separate counter? Defaulting to **separate counter** (same numeric caps).
2. For "Virtual only" — include podcasts (always virtual) and exclude in-person conferences, or treat podcasts as their own tab regardless? Defaulting to **podcasts always shown in their tab**, "Virtual only" filters Conferences tab.
