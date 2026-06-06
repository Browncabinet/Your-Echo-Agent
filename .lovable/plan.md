# Dashboard Review

## What's working
- Clean structure: `ResultsDashboard` wraps `MetricsOverview`, `ABTestingCard`, `WeeklyInsightsCard` + insights blurb.
- Real data from `campaign_sends` / `email_replies` (deduped by status flags) with a Refresh button.
- 7-day caching on Weekly Insights to save AI cost.
- `QuickUpdateBar` and `CampaignQuickSummary` already give a fast per-campaign AI digest from home.

## Issues found

1. **No auto-refresh / no realtime.** Stats only update on mount or manual Refresh. While a campaign is actively sending, the user sees stale numbers until they click.
2. **A/B test data is fake.** `ABTestingCard` reads `openRateA` / `openRateB` off the email object, but nothing in `campaign_sends` records which variant was sent. So "Waiting for results…" is permanent.
3. **Misleading insights copy.** The "Insights & Suggestions" card is hardcoded text (`follow-up #N to non-openers in 3 days`) and isn't tied to actual behavior — duplicates and contradicts the Weekly AI Insights card.
4. **No failure visibility.** `campaign_sends.status='failed'` and `error_message` are never surfaced. A user whose Gmail token broke has no way to see "12 sends failed."
5. **No per-lead drill-down.** You can see totals but not *who* opened/clicked/replied — that's the actionable part for outreach.
6. **No bounce / unsubscribe counter** even though deliverability rules require an unsub link.
7. **Open rate accuracy.** Counts every `opened_at IS NOT NULL` as one open; that's fine, but Apple Mail Privacy inflates opens — worth a small "?" tooltip so users don't over-trust it.
8. **Reply rate denominator.** Donut + funnel use `sent` as the denominator for replies, which is correct, but `email_replies` isn't deduped per lead — two replies from the same person count twice. Should be `COUNT(DISTINCT lead_email)`.
9. **No date filter / no timeline chart.** Hard to tell whether sending is recent or stalled. A simple "sent over time" sparkline would answer "is my campaign actually running?" at a glance.
10. **No campaign-level controls beyond Pause** (just added). Missing: Resend to non-openers, Export CSV of leads + status, Archive/Delete.
11. **Refresh button doesn't reload AI insights or A/B card** — only the top stats — which is confusing because they all look like one panel.
12. **Accessibility / loading**: stat cards show `0` during fetch instead of a skeleton, so on first paint it looks like the campaign failed.

## Proposed improvements (prioritized)

### P0 — correctness & trust
- **Fix reply count** to `COUNT(DISTINCT lead_email)` in `email_replies`.
- **Surface failures**: add a "Failed (N)" stat card that opens a small list of failed recipients + `error_message`. Pull from `campaign_sends` where `status='failed'`.
- **Wire A/B testing to real data** OR hide the card when no variant tracking exists. Recommend adding a `variant` column (`'A' | 'B'`) to `campaign_sends`, randomizing at send time in the `send-campaign-emails` function, then computing rates from sends. (Schema migration required.)

### P1 — usefulness
- **Auto-refresh stats every 30s** while `campaign.status === 'active'` (interval + cleanup), and subscribe to `campaign_sends` realtime inserts/updates for instant updates.
- **Recipients table** below the stats: paginated list of leads with columns Lead, Email, Status badge (sent / opened / clicked / replied / failed), Sent at, Last activity. Sort by latest activity. Solves drill-down + failure visibility in one component.
- **Sent-over-time sparkline** (Recharts AreaChart) grouped by hour/day from `campaign_sends.sent_at` — answers "is it still sending?" at a glance.
- **Replace hardcoded "Insights & Suggestions"** with dynamic rules based on real stats (e.g., only suggest follow-up when `opened/sent < 0.2` AND `sent > 10`), or remove it and let Weekly AI Insights be the single narrative card.

### P2 — actions & polish
- **"Email non-openers" button** that drafts a follow-up to `lead_email` where `opened_at IS NULL` (uses existing `generate-emails` + `send-campaign-emails`).
- **Export CSV** of the recipients table.
- **Skeleton loading** on the stat cards and donuts for the first fetch instead of zeros.
- **Tooltip on Open Rate** explaining Apple Mail Privacy inflation.
- **Make Refresh refresh everything** (stats + A/B + AI insights) and disable all three while loading, so the panel behaves as one unit.

## Technical notes (for build mode)

- Realtime: `supabase.channel(`sends:${campaign.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'campaign_sends', filter: `campaign_id=eq.${campaign.id}` }, () => fetchStats()).subscribe()`.
- A/B variant tracking requires a migration on `campaign_sends` (`variant TEXT`) and a small change in `supabase/functions/send-campaign-emails/index.ts` to pick `subjectB` ~50% of the time when present and write the variant. Per memory `tech/security-hardening`, do NOT add DELETE on `campaign_sends`.
- Reply dedup: change the count query to `.select('lead_email').then(rows => new Set(rows.map(r=>r.lead_email)).size)` or use a SQL view.
- Keep all colors via semantic tokens (already followed in current cards).

## Suggested order to implement

1. P0 fixes (reply dedup, failures card, A/B real data or hide).
2. Realtime + auto-refresh.
3. Recipients table + CSV export.
4. Sent-over-time chart.
5. Polish: skeletons, tooltip, unified refresh, drop the hardcoded insights block.

Want me to implement P0 + realtime first as one PR, or pick a specific subset?
