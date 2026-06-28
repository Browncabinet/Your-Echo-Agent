REVOKE SELECT (owner_email, callback_url) ON public.a2a_agents FROM anon, authenticated;
REVOKE SELECT (smtp_password) ON public.user_email_settings FROM authenticated;