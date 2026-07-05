
REVOKE SELECT ON public.a2a_agent_ratings FROM anon;
GRANT SELECT (id, agent_id, stars, comment, created_at) ON public.a2a_agent_ratings TO anon;
