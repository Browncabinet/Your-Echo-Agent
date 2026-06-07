# Day 4 — Ship remaining options (1 + 3 + 4)

Onboarding (Option 2) already shipped. Now building the rest in one pass.

## Option 1 — Reply intelligence loop (~4h)
**Goal:** Replies drive automation, not just an inbox.

**Schema changes (single migration):**
- `email_replies` add: `intent_score int default 0`, `suggested_reply text default ''`, `auto_paused bool default false`
  *(classification + ai_draft_reply already exist)*
- New `reply_actions_log` table to record auto-pause / auto-draft events (campaign_id, reply_id, action, created_at, user_id) + RLS + GRANTs.

**Edge function updates:**
- Extend `check-replies` (or `reply-handler`) classification prompt to also output `intent_score` (0–100) and `suggested_reply`.
- On classification:
  - `not_interested` / `unsubscribe` / `wrong_person` → mark lead suppressed in `campaign_sends` (status='suppressed' for any queued), set `email_replies.auto_paused=true`, log action.
  - `interested` / `needs_info` → generate `suggested_reply` via Lovable AI, store on row, log action.
- After processing, POST `a2a_callback` of type `reply.classified` to job's `callback_url` when reply ties to an a2a job.

**UI:**
- New `HotRepliesCard.tsx` on Index (logged-in) — top 5 replies with intent_score≥60, "Open & reply" button → opens RepliesInbox prefilled with `suggested_reply`.
- RepliesInbox: show classification badge + intent score, prefill draft textarea with `suggested_reply` when present.

## Option 3 — Marketplace public launch readiness (~5h)
**Goal:** Outside agents can actually onboard, top up, and call the API.

**New page `/for-agents/dashboard`** (`PartnerDashboard.tsx`):
- API key display + masked, copy button, "Rotate key" action (new edge fn `a2a-rotate-key` — creates new key_hash, deactivates old).
- Balance + total_spent (from `a2a_partners`).
- Recent jobs table (from `a2a_jobs` joined by api_key_id).
- Callback log: query `a2a_callbacks_log` table (NEW — needs migration: id, partner_id, event_type, payload jsonb, status, response_code, created_at + RLS + GRANTs). Modify `emitCallback` in `_shared/a2a.ts` to write rows here.

**Rate limiting:** new edge fn helper in `_shared/a2a.ts` `checkRateLimit(api_key_id, limit_per_min)` using new `a2a_rate_buckets` table (api_key_id, window_start, count) — applied in `a2a-agent-hire`. Returns 429 on exceed.

**Public docs page `/for-agents/docs`:** simple static MDX-style React page with curl examples for list / get / hire / job-status, and link to dashboard.

**Live top-up test:** add a "Test top-up ($1)" button (sandbox only) on PartnerBilling that creates a $1 Stripe Checkout via existing `create-checkout` extended with `a2a_credit_test_100` price. Webhook already handles `a2a_credit_*` SKUs.

## Option 4 — Deliverability hardening (~3h)
**Goal:** Protect sender reputation.

**Schema:**
- `domain_throttle` table: user_id, domain, sends_today, last_sent_at, daily_cap (default 50). RLS + GRANTs.
- `bounce_events` table: send_id, type ('hard'|'soft'|'complaint'), reason, created_at. RLS + GRANTs.
- `sender_warmup` table: user_id, domain, day_index, daily_limit (computed 20→50→100→200→500 over 5 days), started_at. RLS + GRANTs.

**Send pipeline updates (`send-campaign-emails` + `a2a-run-job`):**
- Before each send, extract recipient domain → check `domain_throttle.sends_today` < cap → otherwise defer (mark `queued_throttled`).
- Check warm-up daily_limit for sender domain → defer if exceeded.
- Append mandatory unsubscribe footer (audit + ensure present): plain-text link `?u={send_id}` → existing or new `unsubscribe` edge fn flips `email_replies` style suppression row.
- On SMTP error containing bounce-class codes (5.x.x hard, 4.x.x soft, complaint keyword) → insert `bounce_events`, mark send `bounced`.

**UI surface:** small `DeliverabilityCard.tsx` on Index showing today's throttle status, warm-up day, bounce rate (last 7d).

## Order of execution
1. All migrations (one combined) — DB foundation for 1+3+4.
2. Edge function changes (reply classification upgrade, callback logging, rate limit, rotate key, throttle/warmup/bounce, unsubscribe).
3. Frontend: HotRepliesCard, PartnerDashboard, ForAgentsDocs, DeliverabilityCard, RepliesInbox tweaks, route registrations.
4. Memory file updates.

## Out of scope
- No automatic external email send-tests; user can verify in preview.
- LinkedIn flow untouched (assist-only constraint).
- Pricing/products unchanged ($19/$39/$79 weekly + $25/$100/$500 a2a packs); only adds the sandbox $1 test SKU behind a feature flag.

## Risks
- Reply classification prompt change could regress current accuracy — keeping fallback default classification='unknown'.
- Throttle defaults set conservatively (50/day/domain); user-tunable later.
- Rate limit uses table-based counter (not Redis); fine at current volume.

Ready to ship on approval.