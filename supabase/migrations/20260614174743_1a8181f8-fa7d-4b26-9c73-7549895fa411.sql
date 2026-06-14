-- Column-level lockdown for sensitive fields exposed via RLS SELECT policies.

-- 1) a2a_agents.owner_email — table is publicly readable for active agents.
REVOKE SELECT (owner_email) ON public.a2a_agents FROM anon, authenticated;

-- 2) a2a_api_keys.key_hash — owners can SELECT their rows; hash must never reach clients.
REVOKE SELECT (key_hash) ON public.a2a_api_keys FROM anon, authenticated;

-- 3) user_email_settings.smtp_password — users can SELECT own row; password must stay server-side.
REVOKE SELECT (smtp_password) ON public.user_email_settings FROM anon, authenticated;

-- service_role keeps full access (GRANT ALL elsewhere).