---
name: Deliverability Hardening
description: Unsubscribe footer + public unsubscribe fn, suppression list filtering, bounce_events tracking, DeliverabilityCard surface
type: feature
---
## Mandatory unsubscribe
Every send appends:
`You're receiving this from {sender}. Unsubscribe.` → link `/functions/v1/unsubscribe?u={send_id}`

Public edge fn `unsubscribe`:
- Looks up `campaign_sends` by id → upserts `unsubscribes(user_id,email)`
- Suppresses any queued sends to that address

## Suppression checks
`send-campaign-emails` and `a2a-run-job` both filter leads against `unsubscribes` before sending.

## Bounce tracking
`bounce_events(user_id, send_id, lead_email, bounce_type, reason)`:
- hard = matches 5xx codes / user unknown / mailbox unavailable
- soft = other SMTP errors
- complaint = contains 'complaint' or 'spam'
On hard bounce, `campaign_sends.status='bounced'`.

## UI
`DeliverabilityCard` on Index shows last-7-day sent, bounce rate (red if ≥3%), and total unsubscribed.

## Tables
- `unsubscribes(user_id, email UNIQUE, source)` — `link`, `unsubscribe`, `not_interested`, `wrong_person`
- `bounce_events`
- `domain_throttle` and `sender_warmup` — schema ready, enforcement light at MVP volume; tighten when send volume rises
