
-- 1. a2a_agents: revoke owner_email from anon and authenticated (public listings)
REVOKE SELECT (owner_email) ON public.a2a_agents FROM anon, authenticated;
GRANT SELECT (owner_email) ON public.a2a_agents TO service_role;

-- 2. a2a_api_keys: hide key_hash from clients
REVOKE SELECT (key_hash) ON public.a2a_api_keys FROM anon, authenticated;
GRANT SELECT (key_hash) ON public.a2a_api_keys TO service_role;

-- 3. a2a_partners: hide webhook_secret from clients
REVOKE SELECT (webhook_secret) ON public.a2a_partners FROM anon, authenticated;
GRANT SELECT (webhook_secret) ON public.a2a_partners TO service_role;

-- 4. user_email_settings: hide smtp_password from clients
REVOKE SELECT (smtp_password) ON public.user_email_settings FROM anon, authenticated;
GRANT SELECT (smtp_password) ON public.user_email_settings TO service_role;

-- 5. analytics_events: allow service_role full management for cleanup
DROP POLICY IF EXISTS "Service role can manage analytics_events" ON public.analytics_events;
CREATE POLICY "Service role can manage analytics_events"
  ON public.analytics_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
