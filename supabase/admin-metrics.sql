-- Admin Metrics Queries for Your Echo Agent
-- Run these in the Supabase SQL Editor or via psql with service_role

-- 1. Signups today
SELECT COUNT(*) AS signups_today
FROM auth.users
WHERE created_at >= CURRENT_DATE
  AND created_at < CURRENT_DATE + INTERVAL '1 day';

-- 2. Active campaigns (status = 'active')
SELECT COUNT(*) AS active_campaigns
FROM public.campaigns
WHERE status = 'active';

-- 3. Emails sent today
SELECT COUNT(*) AS emails_sent_today
FROM public.campaign_sends
WHERE created_at >= CURRENT_DATE;

-- 4. Total emails sent
SELECT COUNT(*) AS total_emails_sent
FROM public.campaign_sends;

-- 5. Revenue today (subscriptions + credit purchases, in cents)
SELECT COALESCE(
  (SELECT SUM(amount_cents) FROM public.credit_purchases WHERE created_at >= CURRENT_DATE),
  0
) + COALESCE(
  (SELECT SUM(amount_cents) FROM public.a2a_ledger WHERE created_at >= CURRENT_DATE AND amount_cents > 0),
  0
) AS revenue_today_cents;

-- 6. Weekly overview (last 7 days)
SELECT
  DATE_TRUNC('day', created_at) AS day,
  COUNT(*) AS emails_sent,
  COUNT(DISTINCT campaign_id) AS campaigns_active
FROM public.campaign_sends
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY 1
ORDER BY 1 DESC;

-- 7. Top events (analytics)
SELECT event_name, COUNT(*) AS event_count, MAX(created_at) AS last_seen
FROM public.analytics_events
GROUP BY event_name
ORDER BY event_count DESC;
