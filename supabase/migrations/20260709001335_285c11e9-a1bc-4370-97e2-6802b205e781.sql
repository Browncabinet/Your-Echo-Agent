DROP POLICY IF EXISTS "Anyone can view active agents" ON public.a2a_agents;
REVOKE SELECT ON public.a2a_agents FROM anon;