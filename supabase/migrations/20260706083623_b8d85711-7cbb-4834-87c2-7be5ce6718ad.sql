
DROP POLICY IF EXISTS "ratings are public read" ON public.a2a_agent_ratings;

CREATE POLICY "ratings readable by rater or agent owner"
ON public.a2a_agent_ratings
FOR SELECT
TO authenticated
USING (
  auth.uid() = rated_by_user_id
  OR EXISTS (
    SELECT 1 FROM public.a2a_agents a
    WHERE a.agent_id = a2a_agent_ratings.agent_id AND a.owner_user_id = auth.uid()
  )
);

CREATE OR REPLACE VIEW public.a2a_agent_ratings_public
WITH (security_invoker = true) AS
SELECT id, agent_id, stars, comment, created_at
FROM public.a2a_agent_ratings;

GRANT SELECT ON public.a2a_agent_ratings_public TO anon, authenticated;
