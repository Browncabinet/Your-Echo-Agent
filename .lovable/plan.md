## Goal

Make Echo Agent MCP the most useful "where does my audience gather + who do I talk to" tool for AI agents (Claude, Cursor, ChatGPT). Today it discovers events and drafts outreach. This plan adds **category-scoped discovery**, **LinkedIn group inclusion**, **structured contact lists**, and **competitor-audience mining** — plus a handful of features that make agents choose us over raw web search.

---

## 1. What exists today (audit)

MCP tools currently shipped (`mcp-server/src/index.ts`):
- `discover_events` — niche → conferences/webinars/groups/podcasts (Firecrawl + AI, demo tier)
- `draft_outreach_for_event` — subject + body per event
- `generate_comment_for_community` — 2 comment variants
- `add_to_radar` — save to user's Radar (needs API key)
- 6 hiring tools: `list_available_agents`, `get_agent_card`, `hire_echo_agent`, `get_job_status`, `control_job`, `rate_job`

App-side backing (already built): `discover-communities`, `discover-extract-contacts`, `linkedin-groups-research`, `linkedin-generate-actions`, `radar_items`, `discovered_opportunities` (already stores a `contacts` JSON array with name/role/email/linkedin/twitter).

**Gaps vs. what you asked for:**
| You asked for | Status |
|---|---|
| Per-category discovery (groups, orgs, events, conferences, networking) | Partial — `kind` enum exists but "organizations" and "networking events" aren't first-class |
| LinkedIn groups included in discovery | Exists as separate app feature; not exposed as an MCP tool |
| Contact list w/ name, title, company, email, location | Extractor exists but returns free-form; no `company` or `location` field, no MCP tool to trigger it |
| Competitor-audience mining ("where do my competitors' customers hang out") | Missing entirely |
| Make it attractive to agents | Needs discovery quality + differentiators (see §4) |

---

## 2. Category-scoped discovery

Expand `discover_events` into a stronger `discover_communities` MCP tool (keep old name as alias so existing clients don't break):

- `category` (required): `conference | webinar | meetup | networking_event | linkedin_group | facebook_group | slack_community | discord_server | subreddit | professional_association | podcast | newsletter | any`
- `niche` (required): free text
- `location` (optional): city / region / "remote"
- `date_range` (optional): `next_30_days | next_90_days | evergreen`
- `min_relevance` (optional 0–1): AI fit-score threshold

Returns per result: title, url, category, description, estimated audience size, fit-score, next date (if event), primary organizer handle.

Backed by the existing `discover-communities` edge function extended with category-specific Firecrawl search patterns.

## 3. LinkedIn groups + contact lists

Two new MCP tools that surface app functionality already built:

**`find_linkedin_groups`** — wraps `linkedin-groups-research`. Input: `niche`, `seniority?`, `region?`. Output: group name, url, member count est., recent activity signal, join criteria, suggested primary group flag. Cached 7 days per existing `linkedin_groups_research` table.

**`extract_contacts_for_opportunity`** — wraps `discover-extract-contacts` (needs API key). Input: `opportunity_url` OR `opportunity_id`. Output: structured contacts array with **name, title, company, email, location, linkedin_url, twitter_url, source_url, confidence**. Requires extending the extractor prompt + `discovered_opportunities.contacts` shape to include `company` and `location` (they're currently absent).

Add a batch convenience tool: **`build_contact_list`** — input: `niche` + `category` + `limit`. Runs discovery → extract → deduped merged CSV/JSON list. This is the "one-shot lead list" flow agents will love.

## 4. Competitor-audience mining (new)

**`find_competitor_audiences`** — input: `competitor_domains: string[]` (+ optional `niche`).
Pipeline: Firecrawl scrape of each competitor's site (case studies, testimonials, blog author bios, "as seen in", event sponsorships) + LinkedIn public company page snippets → AI aggregates: which events they sponsor/speak at, which groups their team belongs to, which podcasts they appear on, common customer titles/industries.

Output: ranked list of communities/events + a "watchlist" of contact archetypes to target. Feeds directly into `discover_communities` and `build_contact_list`.

## 5. Features that make agents pick us over web search

Add these to round out the agent value prop:

1. **`enrich_contact`** — input: name + company (or LinkedIn URL) → verified email guess (pattern-based, checked against catch-all), title, location, seniority. Uses Firecrawl + AI; no scraping of gated LinkedIn.
2. **`monitor_niche`** — save a niche + categories as a standing watch. New matches land in Radar weekly. Tool returns the watch id; app UI shows the digest. Uses new `radar_watches` table.
3. **`score_fit`** — input: `opportunity_url` + `sender_pitch` → 0–100 fit score + 1-line rationale. Cheap, fast, keeps agents from spamming.
4. **`draft_outreach_sequence`** — 3-touch sequence (initial + 2 follow-ups) instead of single email. Same input shape as `draft_outreach_for_event`.
5. **`export_list`** — input: `radar_ids[]` or filter → CSV / Google Sheet URL (Sheets via connector when connected, CSV file otherwise).
6. **`suggest_next_action`** — input: `contact_id` → recommends "comment on their post" vs "connect + note" vs "cold email" vs "warm intro request", grounded in the contact's activity + assist-only LinkedIn rule.
7. **Assist-only LinkedIn stays enforced** — no auto-connect / auto-post (project core memory). Every LinkedIn tool returns copy-ready text + `open_url` for the human to click.
8. **Free demo tier stays generous** — discovery + drafts work with no key; only contact extraction, radar save, enrichment, and sequences require `ECHO_API_KEY`. Keeps the "npx and try it" install magical.

## 6. Deliverables (implementation phases)

| Phase | Scope | Files |
|---|---|---|
| A | Extend `discovered_opportunities.contacts` shape (add company, location); update `discover-extract-contacts` prompt | migration + edge fn |
| B | Add MCP tools: `discover_communities` (supersedes `discover_events`), `find_linkedin_groups`, `extract_contacts_for_opportunity`, `build_contact_list` | `mcp-server/src/index.ts`, `mcp-http/index.ts` |
| C | New edge fn `discover-competitor-audiences` + MCP tool `find_competitor_audiences` | new fn + tool |
| D | New tools: `enrich_contact`, `score_fit`, `draft_outreach_sequence`, `export_list`, `suggest_next_action` | edge fns + tools |
| E | `monitor_niche` + `radar_watches` table + weekly cron | migration + fn + cron |
| F | Bump MCP version to 0.3.0, update README tool table, republish npm + resubmit Glama | `mcp-server/README.md`, `CHANGELOG.md`, `package.json` |

## 7. Not doing (explicit exclusions)

- No LinkedIn scraping behind auth walls — TOS and detection risk.
- No auto-connect / auto-message on LinkedIn (project constraint).
- No paid contact-data reseller integrations in v1 (Apollo/ZoomInfo) — revisit once demand proves out.
- No new UI surfaces in this plan; app tabs (LinkedIn Activity, Radar) already exist and consume the same backend.

---

Reply "go" to implement, or tell me which phases to drop/reorder.
