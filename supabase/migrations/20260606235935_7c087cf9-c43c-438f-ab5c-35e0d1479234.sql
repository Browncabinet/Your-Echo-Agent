
CREATE TABLE public.linkedin_groups_research (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  niche text NOT NULL,
  audience text NOT NULL DEFAULT '',
  results jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);
CREATE INDEX idx_lgr_user_niche ON public.linkedin_groups_research(user_id, lower(niche));
GRANT SELECT ON public.linkedin_groups_research TO authenticated;
GRANT ALL ON public.linkedin_groups_research TO service_role;
ALTER TABLE public.linkedin_groups_research ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own group research" ON public.linkedin_groups_research
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
