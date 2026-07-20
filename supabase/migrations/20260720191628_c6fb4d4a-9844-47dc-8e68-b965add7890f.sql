
DROP POLICY IF EXISTS "Public can read codes" ON public.referral_codes;
REVOKE SELECT ON public.referral_codes FROM anon;

CREATE POLICY "Owners can read their own codes"
  ON public.referral_codes FOR SELECT TO authenticated
  USING (auth.uid() = owner_user_id);
