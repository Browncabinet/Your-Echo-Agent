
-- 1) user_email_settings: hide smtp_password from clients
REVOKE SELECT ON public.user_email_settings FROM authenticated;
REVOKE SELECT ON public.user_email_settings FROM anon;
GRANT SELECT (
  id, user_id, provider, email_address, smtp_host, smtp_port, smtp_username,
  is_connected, created_at, updated_at, scheduling_link, email_alerts_paused
) ON public.user_email_settings TO authenticated;

-- 2) a2a_api_keys: hide key_hash from clients
REVOKE SELECT ON public.a2a_api_keys FROM authenticated;
REVOKE SELECT ON public.a2a_api_keys FROM anon;
GRANT SELECT (
  id, key_prefix, owner_email, owner_name, status, rate_limit_per_min,
  notes, created_at, last_used_at, owner_user_id
) ON public.a2a_api_keys TO authenticated;

-- 3) a2a_agents: hide callback_url from anon and authenticated
REVOKE SELECT ON public.a2a_agents FROM anon;
REVOKE SELECT ON public.a2a_agents FROM authenticated;
GRANT SELECT (
  agent_id, name, tagline, description, niche, persona, capabilities,
  pricing_per_lead_cents, pricing_per_reply_cents, pricing_per_meeting_cents,
  rating, jobs_completed, active, version, created_at, updated_at,
  owner_user_id, owner_email
) ON public.a2a_agents TO anon;
GRANT SELECT (
  agent_id, name, tagline, description, niche, persona, capabilities,
  pricing_per_lead_cents, pricing_per_reply_cents, pricing_per_meeting_cents,
  rating, jobs_completed, active, version, created_at, updated_at,
  owner_user_id, owner_email
) ON public.a2a_agents TO authenticated;

-- 4) Drop misleading public-role "service_role" policies
DROP POLICY IF EXISTS "Service role can manage purchases" ON public.credit_purchases;
DROP POLICY IF EXISTS "Service role can manage credits" ON public.user_credits;
DROP POLICY IF EXISTS "Service role manages usage" ON public.weekly_usage;
