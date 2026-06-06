REVOKE INSERT, DELETE ON public.campaign_sends FROM authenticated;
GRANT ALL ON public.campaign_sends TO service_role;

CREATE POLICY "Service role can insert sends"
ON public.campaign_sends FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can delete sends"
ON public.campaign_sends FOR DELETE
TO service_role
USING (true);