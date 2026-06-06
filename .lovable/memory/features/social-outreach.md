---
name: Social Outreach
description: LinkedIn Assist — AI suggests groups + drafts comments and DMs, user posts manually. No automation.
type: feature
---
LinkedIn outreach is **assist-only** (not automation) because LinkedIn's API does not allow third-party comment posting, DMs to non-1st-degree contacts, or group member access. UI scraping violates LinkedIn TOS.

The `linkedin-assist` edge function calls Lovable AI Gateway (Gemini 2.5 Flash) with niche + audience + lead context and returns JSON with:
- 3 suggested groups/orgs to manually search (each with a LinkedIn search URL deep link)
- 3 comment drafts
- 3 DM openers

Frontend: `src/components/LinkedInAssistPanel.tsx` mounted inside the Social view. Copy-to-clipboard buttons, "Open in LinkedIn" external links, plus a visible disclaimer that the user posts/messages themselves.

Each successful generation increments `weekly_usage.linkedin_actions`. Limit enforced server-side by tier (50 / 150 / 400). The panel also covers basic templates for IG and X via the existing `SocialMediaContent` component below it.
