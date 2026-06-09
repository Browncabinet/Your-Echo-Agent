
-- a2a_api_keys.key_hash: hide from clients
REVOKE SELECT (key_hash) ON public.a2a_api_keys FROM authenticated, anon;

-- user_email_settings.smtp_password: hide from clients but allow write
REVOKE SELECT (smtp_password) ON public.user_email_settings FROM authenticated, anon;
GRANT INSERT (smtp_password), UPDATE (smtp_password) ON public.user_email_settings TO authenticated;

-- a2a_agents.owner_email: hide from public/auth readers
REVOKE SELECT (owner_email) ON public.a2a_agents FROM anon, authenticated;

-- a2a_partners.webhook_secret: hide from owner reads
REVOKE SELECT (webhook_secret) ON public.a2a_partners FROM authenticated, anon;
