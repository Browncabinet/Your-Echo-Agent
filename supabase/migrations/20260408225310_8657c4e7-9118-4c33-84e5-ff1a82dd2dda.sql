-- Revoke SELECT on smtp_password column for authenticated role
-- This prevents the browser client from reading SMTP passwords
-- Edge functions use service_role which bypasses RLS and column grants
REVOKE SELECT (smtp_password) ON public.user_email_settings FROM authenticated;
REVOKE SELECT (smtp_password) ON public.user_email_settings FROM anon;