---
name: LinkedIn Activity Tab
description: Assist-only LinkedIn action queue — group research, AI-drafted comments/connections/follow-ups, copy & open workflow
type: feature
---
Primary surface on the campaign dashboard. Tabs: LinkedIn Activity | Email Assist | Other Social.

## Components
- `LinkedInGroupsResearch` — Firecrawl + AI; 7-day cache in `linkedin_groups_research`. Each result has a "Use as primary" button that writes to localStorage `lk_primary_{campaignId}_name|_url` and fires `lk-primary-changed` event.
- `LinkedInActivityTab` — reads primary group from localStorage, listens for change event. Generate button calls `linkedin-generate-actions` edge function.

## Backend
- Table `linkedin_actions`: kind ∈ {comment, connection_request, follow_up_message, profile_view}, target_group, target_person, draft_text, context_url, status ∈ {pending, done, skipped}.
- Edge fn `linkedin-generate-actions` → AI produces 6-8 actions for a campaign + group, inserts via service-role.
- "Copy & Open LinkedIn" = navigator.clipboard.writeText + window.open(context_url).

## Constraint
Strictly assist-only. No auto-post, no auto-connect (project core memory).
