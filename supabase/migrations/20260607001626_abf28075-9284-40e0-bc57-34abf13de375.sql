
CREATE TABLE public.linkedin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  campaign_id uuid,
  kind text NOT NULL,
  target_group text NOT NULL DEFAULT '',
  target_person text NOT NULL DEFAULT '',
  draft_text text NOT NULL DEFAULT '',
  context_url text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
CREATE INDEX idx_linkedin_actions_user ON public.linkedin_actions(user_id, status, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.linkedin_actions TO authenticated;
GRANT ALL ON public.linkedin_actions TO service_role;
ALTER TABLE public.linkedin_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own actions" ON public.linkedin_actions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own actions" ON public.linkedin_actions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own actions" ON public.linkedin_actions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own actions" ON public.linkedin_actions FOR DELETE TO authenticated USING (auth.uid() = user_id);
