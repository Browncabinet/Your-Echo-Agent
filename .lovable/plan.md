## Finish remaining Day 4 gaps

Close the four outstanding items so human campaigns and marketplace (A2A) jobs share the same deliverability safeguards.

### 1. Warm-up enforcement (both senders)
In `send-campaign-emails` and `a2a-run-job`, before each send:
- Look up `sender_warmup` by `(user_id, domain)` of the from-address.
- If no row exists, create one with `day_index=1`, `daily_limit=20`, `sent_today=0`.
- If `last_sent_date < today`, advance: `day_index += 1`, `daily_limit = min(20 + (day_index-1)*20, 200)`, reset `sent_today=0`.
- If `sent_today >= daily_limit`, mark the send `queued_warmup` and skip.
- After a successful send, increment `sent_today` and set `last_sent_date = today`.

### 2. Domain throttle in `a2a-run-job`
Port the existing throttle logic from `send-campaign-emails`:
- Read/upsert `domain_throttle` per `(user_id, recipient_domain, today)`.
- Skip with `queued_throttled` when `sends_today >= daily_cap` (50).
- Bump `sends_today` after each successful send.

### 3. Bounce logging in `a2a-run-job`
On SMTP failure, insert into `bounce_events` with `user_id`, `lead_email`, `send_id`, `bounce_type` (soft/hard heuristic from SMTP error code), and `reason`, matching the human flow.

### 4. DeliverabilityCard: warm-up status
Add a third stat to `DeliverabilityCard.tsx`: "Warm-up day X / daily cap Y" pulled from the user's most recent `sender_warmup` row. Keep existing bounce-rate and unsubscribe tiles.

### Schema
No migrations needed — `sender_warmup`, `domain_throttle`, and `bounce_events` already exist with the required columns. Service-role writes happen from edge functions.

### Files touched
- `supabase/functions/send-campaign-emails/index.ts` — add warm-up check + bump.
- `supabase/functions/a2a-run-job/index.ts` — add throttle, warm-up, and bounce logging.
- `src/components/DeliverabilityCard.tsx` — add warm-up tile + query.

### Verification
- Deploy both edge functions; tail logs while triggering a small campaign and a sandbox A2A job to confirm `queued_warmup` / `queued_throttled` statuses appear when caps are hit and `bounce_events` rows show up on simulated failures.
- Load the dashboard and confirm the warm-up tile renders with real data.
