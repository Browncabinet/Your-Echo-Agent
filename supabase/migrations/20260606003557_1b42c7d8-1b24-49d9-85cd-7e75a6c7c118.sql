
-- 1. Restrict SELECT on smtp_password column so authenticated users can't read it back
REVOKE SELECT (smtp_password) ON public.user_email_settings FROM authenticated;
REVOKE SELECT (smtp_password) ON public.user_email_settings FROM anon;
-- Authenticated still needs INSERT/UPDATE to save credentials
GRANT INSERT (smtp_password), UPDATE (smtp_password) ON public.user_email_settings TO authenticated;

-- 2. Add DELETE policies so users can remove their own data
CREATE POLICY "Users can delete own email settings"
  ON public.user_email_settings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sends"
  ON public.campaign_sends
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Revoke EXECUTE on SECURITY DEFINER trigger function from public/anon/authenticated
REVOKE EXECUTE ON FUNCTION public.handle_new_user_credits() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_credits() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_credits() FROM authenticated;
