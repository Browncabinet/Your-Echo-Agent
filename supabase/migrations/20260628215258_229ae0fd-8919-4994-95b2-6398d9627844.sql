
-- 1) Restrict column-level SELECT on a2a_agent_ratings sensitive columns
REVOKE SELECT (partner_id, api_key_id) ON public.a2a_agent_ratings FROM anon, authenticated;

-- 2) Add explicit UPDATE policy on a2a_agents preventing owner from flipping active=true
CREATE POLICY "owner can update own draft agents"
ON public.a2a_agents
FOR UPDATE
TO authenticated
USING (owner_user_id = auth.uid() AND active = false)
WITH CHECK (owner_user_id = auth.uid() AND active = false);
