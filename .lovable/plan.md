# P1 follow-up: A/B variants + Recipients + Sent-over-time

## 1. A/B variant tracking (real data)

**Migration** on `campaign_sends`: add `variant TEXT NULL` (values `'A'` or `'B'`, null when no test).

**Edge function** (`send-campaign-emails`): for each lead, if `emailTemplate.subjectB` exists, pick variant via `Math.random() < 0.5 ? 'A' : 'B'`, use the matching subject (`subject` or `subjectB`), and write `variant` on the insert.

**ABTestingCard**: fetch sends for this campaign, compute per-variant `opens / sent` from `campaign_sends` (group by `variant`), and render real rates. Drop the stale `openRateA`/`openRateB` fields on the email object. Show "Need at least 5 sends per variant" guard before declaring a winner.

## 2. Recipients table

New component `RecipientsTable` under the stats. Source: `campaign_sends` filtered by campaign.

Columns: Lead (name), Email, Status badge (queued / sent / opened / clicked / replied / failed), Sent at, Last activity.
- Derived status precedence: replied > clicked > opened > failed > sent > queued.
- Replies joined from `email_replies` by `lead_email` (in-memory join — small N).
- Paginated client-side, 25 per page; sort by Last activity desc by default.
- Search box filters by name/email.
- "Export CSV" button (same data, comma-escaped, downloaded via Blob).
- Realtime: piggyback on the existing channel in `ResultsDashboard` (lift fetch into the dashboard and pass rows down, or have the table subscribe itself — will subscribe itself to keep `ResultsDashboard` thin).

## 3. Sent-over-time sparkline

New component `SendsTimeline` placed between the stat cards and the Insights card.
- Query `campaign_sends.sent_at` where status='sent' for this campaign.
- Bucket into the last 14 days by day (or last 24h by hour when campaign is <2 days old).
- Render with Recharts `AreaChart` using `hsl(var(--primary))`, no axes labels, small height (~80px), tooltip on hover.
- Empty state: "No sends yet."

## Files to touch

- `supabase/migrations/<new>.sql` — add `variant` column.
- `supabase/functions/send-campaign-emails/index.ts` — pick + persist variant.
- `src/components/dashboard/ABTestingCard.tsx` — fetch real rates from sends.
- `src/components/dashboard/RecipientsTable.tsx` — new.
- `src/components/dashboard/SendsTimeline.tsx` — new.
- `src/components/steps/ResultsDashboard.tsx` — mount the two new components.
- (Optional) `src/lib/campaign-data.ts` — remove obsolete `openRateA`/`openRateB` fields from `EmailTemplate` type if unused elsewhere.

## Notes / constraints

- Per `tech/security-hardening`: do not add DELETE on `campaign_sends`. Existing RLS already covers SELECT for the owner.
- Migration is additive and nullable — no backfill needed; existing rows simply have `variant = NULL` and are excluded from A/B totals.
- Keep colors via semantic tokens; no raw hex.
- Realtime channel for the table will use a distinct name (`recipients:${campaign.id}`) so it doesn't clash with the dashboard's.

Ship as one PR.
