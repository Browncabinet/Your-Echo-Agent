-- Restrict direct SELECT on public.a2a_agents to the owner only.
-- Public marketplace reads go through edge functions (service_role) which bypass RLS,
-- so this does not affect the marketplace listing UX but prevents exposure of
-- owner_email and callback_url to other authenticated users.
DROP POLICY IF EXISTS "owner can read own draft agents" ON public.a2a_agents;

CREATE POLICY "owner can read own agents"
ON public.a2a_agents
FOR SELECT
TO authenticated
USING (owner_user_id = auth.uid());