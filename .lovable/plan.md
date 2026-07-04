## Goal (revised)

Turn Echo Agent MCP into a full **personalized PR outreach loop**: from any MCP client (Claude/Cursor/ChatGPT), an agent should be able to run one prompt and get:

1. A category-scoped list of groups/orgs/events/conferences/LinkedIn groups.
2. Contacts inside each source (name, title, company, email, location).
3. A **draft personalized email per contact** — grouped by source — with a short pitch + reason for reaching out + a meeting-scheduling ask (phone / in-person / online) and "reply by email" CTA.
4. **Send** those emails through the user's sender identity, then track replies.

Phases A+B already shipped (v0.3.0): `discover_communities`, `find_linkedin_groups`, `extract_contacts_from_url`, `build_contact_list`. This plan is the outreach-generation and sending layer on top.

---

## 1. New MCP tool: `draft_pr_outreach_for_contacts`

Public demo — no send, just drafts. Lets any agent try the full flow instantly.

**Input:**
- `contacts` (array, required): from `build_contact_list` or user-supplied. Each: `{ name, title?, company?, email?, source_title, source_url, category }`.
- `sender` (object, required): `{ name, company, one_line_pitch, services_short, meeting_options?: ["phone","in_person","online"], scheduling_link?, reply_email }`.
- `tone` (optional): `friendly | professional | concise`. Default `professional`.

**Output — grouped by source:**
```json
{
  "groups": [
    {
      "source_title": "AI Founders Summit 2026",
      "source_url": "https://…",
      "category": "conference",
      "drafts": [
        {
          "to": { "name": "…", "title": "…", "company": "…", "email": "…" },
          "subject": "…",
          "body": "…",   // includes pitch + reason + meeting ask + reply CTA
          "meeting_options": ["phone","online"],
          "reply_to": "founder@example.com"
        }
      ]
    }
  ],
  "total_drafts": 12
}
```

**Prompt contract for the model** (kept in the tool so drafts are consistent):
- Under 110 words.
- Line 1: personalized hook that references the *source* (e.g., "I saw you're organizing the AI Founders Summit…").
- Line 2: 1-sentence pitch (`services_short`).
- Line 3: one specific *why you* reason tied to the contact's title/company.
- Line 4: meeting ask offering the sender's allowed `meeting_options` ("15 min — phone, online, or in-person if you're in {location}") + `scheduling_link` if provided.
- Line 5: "Reply to this email and I'll send times" / route to `reply_email`.
- No emojis, no "Hope this finds you well".

## 2. New MCP tool: `run_pr_outreach` (send)

Requires `ECHO_API_KEY`. Wraps the same draft step and then routes each draft into the existing Echo Agent send pipeline (already used by `hire_echo_agent` → `send-campaign-emails` → deliverability, throttling, reply tracking).

**Input:** same as `draft_pr_outreach_for_contacts` **plus** `sender_identity` (name + verified email + optional company + scheduling_link), `spending_cap_cents?`, `review_before_send?: boolean` (default `true`).

**Behavior:**
- If `review_before_send: true` (default) → returns `{ job_id, drafts, status: "awaiting_approval" }` and stores drafts in a new `pr_outreach_jobs` row. User approves via existing app UI or by calling `approve_pr_outreach_job`.
- If `review_before_send: false` → creates campaign + queues sends immediately; reuses weekly caps and unsubscribe rules already in place.
- Every email carries `Reply-To: sender_identity.email`, so replies land in the sender's inbox and also get ingested by `check-replies` for the reply-intelligence tab.

**New helper tools shipped alongside:**
- `list_pr_outreach_jobs` — status/counts per job.
- `approve_pr_outreach_job` / `cancel_pr_outreach_job` — flip a queued job.
- `get_pr_outreach_replies` — replies grouped by contact + source, with AI classification (`positive | neutral | negative | meeting_requested | unsubscribe`).

## 3. Convenience mega-tool: `find_and_pitch`

One call, whole loop. Public demo drafts only; sends require API key.

**Input:** `{ niche, category, location?, sender: {...}, sources?: 1–3, review_before_send?: true }`

**Pipeline:** `discover_communities` → `extract_contacts_from_url` per source → dedupe → `draft_pr_outreach_for_contacts` → if key + `review_before_send=false`, `run_pr_outreach`.

**Returns:** grouped drafts + (if sending) `job_id` for polling with `get_pr_outreach_replies`.

## 4. Backend additions (Lovable Cloud)

- New table `pr_outreach_jobs` (user_id, sender_identity JSONB, drafts JSONB, status: `draft|awaiting_approval|queued|sending|completed|canceled`, campaign_id FK to `campaigns`, spending_cap_cents, created_at, updated_at). RLS: user owns their rows; service_role full.
- New edge fn `pr-outreach-draft` — takes contacts + sender, runs Lovable AI, returns grouped drafts. Called by both the MCP tool and app UI.
- New edge fn `pr-outreach-send` — persists job, converts to a `campaigns` + `campaign_sends` batch, invokes existing `send-campaign-emails` pipeline. Enforces the same weekly email cap (`current_week_caps` RPC) so no bypass.
- Extend `check-replies` classifier to add label `meeting_requested` so agents can filter.

## 5. Deliverability & compliance guardrails (mandatory)

- Every send uses the user's verified sender identity (existing `a2a_byo_smtp` or platform SMTP with confirmed From).
- Mandatory one-click unsubscribe footer appended by `send-campaign-emails` — never authored by the AI (existing rule).
- Suppression list (`unsubscribes`, `suppressed_emails`, `bounce_events`) is checked before send — no drafts to suppressed addresses.
- Weekly caps enforced (`current_week_caps`) — no bypass, no separate quota.
- Rate-limited per sending domain via `domain_throttle`.
- LinkedIn contacts get **drafted only, never auto-sent** (LinkedIn assist-only rule stays). LinkedIn drafts are returned as copy-ready comments/DMs alongside email drafts for non-LinkedIn contacts in the same job.
- Skip any contact where `confidence < 0.6` OR `email` looks generic (`info@`, `hello@`, `contact@`) unless it's the *only* signal for that source — surface those as "needs manual review" in the response instead of sending.

## 6. What the agent experience looks like

Prompt in Claude:
> "Find AI-agent conferences and LinkedIn groups. Pull the organizers. Draft a personalized email from Alex Chen at Lensora (agent observability) asking each for a 15-min intro — phone, online, or in-person if they're in SF. Send them and let me know when replies come in."

Tool trace: `find_and_pitch` (returns grouped drafts) → user says "looks good, send" → `approve_pr_outreach_job` → `get_pr_outreach_replies` polled by the agent.

## 7. Implementation phases

| Phase | Scope |
|---|---|
| G | `pr-outreach-draft` edge fn + `draft_pr_outreach_for_contacts` MCP tool (demo tier, no key). |
| H | `pr_outreach_jobs` table + `pr-outreach-send` fn + `run_pr_outreach` / `approve_pr_outreach_job` / `cancel_pr_outreach_job` / `list_pr_outreach_jobs` tools. |
| I | `find_and_pitch` mega-tool + `get_pr_outreach_replies`. |
| J | Bump MCP to v0.4.0, update README + CHANGELOG, republish npm. |

## 8. Not doing

- No auto-send to LinkedIn contacts (assist-only stays).
- No bulk marketing / newsletter sends — one triggering event per recipient.
- No new UI in this plan; existing Campaign + Replies tabs render the same jobs (a small "PR Outreach" filter chip will be added when we have UI time — not blocking).
- No paid data enrichment (Apollo/ZoomInfo) — deferred.

---

Reply "go" to build Phase G+H first (draft + send with review), or tell me to reorder.
