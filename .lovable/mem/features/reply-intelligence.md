---
name: Reply Intelligence Loop
description: AI classifies replies with intent_score, auto-suppresses negatives, auto-drafts positives, fires reply.classified webhooks to a2a partners
type: feature
---
## Flow
`check-replies` (IMAP poll) → for each new reply:
1. AI classify → `{classification, intent_score 0-100, suggested_reply, draftReply, suggestedAction}`
   - Classifications: interested, not_interested, unsubscribe, wrong_person, question, objection, needs_info, unknown
2. **Auto-suppress** for unsubscribe / not_interested / wrong_person:
   - Insert into `unsubscribes(user_id,email)`
   - Set queued `campaign_sends.status='suppressed'`
   - Log `reply_actions_log.action='auto_suppress'`
3. **Auto-draft** for interested / needs_info:
   - Stored in `email_replies.suggested_reply` (prefilled in RepliesInbox editor)
   - Log `reply_actions_log.action='auto_draft'`
4. **Webhook** if campaign tied to an `a2a_jobs` row with callback_url → POST `reply.classified` with intent_score

## UI
- `HotRepliesCard` on Index — top 5 pending replies with intent_score ≥ 60
- `RepliesInbox` shows classification badge + intent score, prefills editor with suggested_reply

## Tables touched
- `email_replies` adds: intent_score (int), suggested_reply (text), auto_paused (bool)
- New `reply_actions_log` — audit trail
- `unsubscribes` — global suppression per user
