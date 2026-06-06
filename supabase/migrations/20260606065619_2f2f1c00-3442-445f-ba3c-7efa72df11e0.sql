-- Explicitly revoke SELECT on smtp_password from client roles
REVOKE SELECT (smtp_password) ON public.user_email_settings FROM anon;
REVOKE SELECT (smtp_password) ON public.user_email_settings FROM authenticated;

-- Ensure writes still work for the upsert flow
GRANT INSERT (smtp_password), UPDATE (smtp_password) ON public.user_email_settings TO authenticated;

-- Lock down the credit-bootstrap trigger function to service_role only
REVOKE EXECUTE ON FUNCTION public.handle_new_user_credits() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_credits() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_credits() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user_credits() TO service_role;