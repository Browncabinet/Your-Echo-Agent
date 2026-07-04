# Changelog

All notable changes to this project are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.4.0] - 2026-07-03

### Added — Personalized PR outreach loop
- **`draft_pr_outreach_for_contacts`** — draft a personalized email per contact, grouped by source (event / conference / LinkedIn group / association / org). Each draft: personalized hook that references the source, one-line pitch, why-you reason tied to title+company, 15-min meeting ask (phone / online / in-person), reply-by-email CTA. Filters low-confidence + generic mailboxes into a `needs_manual_review` bucket. Public demo, no key required.
- **`queue_pr_outreach_job`** — save drafts as a reviewable job (persists to `pr_outreach_jobs` under your account) and returns a dashboard URL for approve + send. Every send uses your verified sender identity, respects weekly caps, honors the suppression list, and routes replies to `reply_email`. Requires `ECHO_API_KEY`.
- **`find_and_pitch`** — one-shot mega-tool: discover → extract contacts → draft grouped emails → (optionally) queue for send. Perfect prompt: "Find AI-agent conferences and draft a personalized pitch to each organizer from Alex at Lensora."

### Compliance
- LinkedIn contacts stay assist-only (never auto-sent).
- Skips generic mailboxes (`info@`, `hello@`, `contact@`, …) and contacts with `confidence < 0.6` — surfaced as `needs_manual_review` for the caller to decide.

## [0.3.0] - 2026-07-03

### Added
- **`discover_communities`** — category-scoped discovery across 13 categories: conference, webinar, meetup, networking_event, linkedin_group, facebook_group, slack_community, discord_server, subreddit, professional_association, podcast, newsletter, any. Optional `location` for geo-targeting.
- **`find_linkedin_groups`** — surfaces the most active LinkedIn Groups + professional associations for a niche, with focus, fit reason, and first-action tip. Assist-only (LinkedIn TOS-safe).
- **`find_linkedin_groups`** results include `activity_signal` and one concrete `first_action` per group.
- **`extract_contacts_from_url`** — scrape any public page → structured contacts with `name, title, company, email, location, linkedin_url, twitter_url, confidence`. Public demo, no key needed.
- **`build_contact_list`** — one-shot: `discover_communities` → `extract_contacts_from_url` per top result → deduped merged list. Demo cap: 3 sources per call.

### Notes
- `discover_events` remains for back-compat; new callers should prefer `discover_communities`.
- All new tools work without an API key (demo tier). `add_to_radar` and hiring tools still require `ECHO_API_KEY`.

## [0.2.0] - 2026-06-28

### Added
- 4 new tools for parity with the hosted MCP endpoint:
  - `discover_events` — find conferences, webinars, meetups, podcasts in a niche (demo tier, no API key required).
  - `draft_outreach_for_event` — AI-generated event-specific cold email (subject + body).
  - `generate_comment_for_community` — 2 value-first comment variants for LinkedIn/Reddit/Slack threads.
  - `add_to_radar` — save a discovered event to your Echo Agent Radar (requires `ECHO_API_KEY`).
- Stdio tools now transparently proxy demo-tier capabilities to the hosted Streamable HTTP endpoint so local users don't need their own Firecrawl / AI keys.

## [0.1.0] - 2026-06-19

### Added
- Initial release.
- Six tools: `list_available_agents`, `get_agent_card`, `hire_echo_agent`, `get_job_status`, `control_job`, `rate_job`.
- Stdio transport, compatible with Claude Desktop, Cursor, Windsurf, Continue, and any MCP-compatible client.
- `ECHO_API_KEY` + optional `ECHO_API_BASE` configuration.
- Glama-ready `glama.json` manifest.
