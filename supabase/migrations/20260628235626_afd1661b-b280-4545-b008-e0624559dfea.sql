REVOKE SELECT (smtp_password) ON public.user_email_settings FROM authenticated;
REVOKE SELECT (smtp_password) ON public.user_email_settings FROM anon;