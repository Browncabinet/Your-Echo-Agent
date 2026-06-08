
-- 1) campaign_sends: drop authenticated UPDATE policy (writes go via service_role edge functions)
DROP POLICY IF EXISTS "Users can update own sends" ON public.campaign_sends;

-- 2) Replace auth.role()='service_role' policies with proper role-scoped policies
-- subscriptions
DROP POLICY IF EXISTS "Service role can insert subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Service role can update subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Service role can delete subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Service role manages subscriptions" ON public.subscriptions;
CREATE POLICY "Service role manages subscriptions"
  ON public.subscriptions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- weekly_usage
DROP POLICY IF EXISTS "Service role can insert weekly_usage" ON public.weekly_usage;
DROP POLICY IF EXISTS "Service role can update weekly_usage" ON public.weekly_usage;
DROP POLICY IF EXISTS "Service role can delete weekly_usage" ON public.weekly_usage;
DROP POLICY IF EXISTS "Service role manages weekly_usage" ON public.weekly_usage;
CREATE POLICY "Service role manages weekly_usage"
  ON public.weekly_usage FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- user_credits
DROP POLICY IF EXISTS "Service role can insert user_credits" ON public.user_credits;
DROP POLICY IF EXISTS "Service role can update user_credits" ON public.user_credits;
DROP POLICY IF EXISTS "Service role can delete user_credits" ON public.user_credits;
DROP POLICY IF EXISTS "Service role manages user_credits" ON public.user_credits;
CREATE POLICY "Service role manages user_credits"
  ON public.user_credits FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- credit_purchases
DROP POLICY IF EXISTS "Service role can insert credit_purchases" ON public.credit_purchases;
DROP POLICY IF EXISTS "Service role can update credit_purchases" ON public.credit_purchases;
DROP POLICY IF EXISTS "Service role can delete credit_purchases" ON public.credit_purchases;
DROP POLICY IF EXISTS "Service role manages credit_purchases" ON public.credit_purchases;
CREATE POLICY "Service role manages credit_purchases"
  ON public.credit_purchases FOR ALL TO service_role
  USING (true) WITH CHECK (true);
