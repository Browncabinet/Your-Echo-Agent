
CREATE TABLE public.pr_outreach_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  a2a_partner_id UUID REFERENCES public.a2a_partners(id) ON DELETE CASCADE,
  a2a_api_key_id UUID REFERENCES public.a2a_api_keys(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  sender_identity JSONB NOT NULL,
  niche TEXT,
  category TEXT,
  drafts JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'awaiting_approval',
  total_drafts INTEGER NOT NULL DEFAULT 0,
  spending_cap_cents INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pr_outreach_jobs TO authenticated;
GRANT ALL ON public.pr_outreach_jobs TO service_role;

ALTER TABLE public.pr_outreach_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own pr_outreach_jobs"
  ON public.pr_outreach_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own pr_outreach_jobs"
  ON public.pr_outreach_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own pr_outreach_jobs"
  ON public.pr_outreach_jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own pr_outreach_jobs"
  ON public.pr_outreach_jobs FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER pr_outreach_jobs_touch
  BEFORE UPDATE ON public.pr_outreach_jobs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX pr_outreach_jobs_user_status_idx
  ON public.pr_outreach_jobs (user_id, status, created_at DESC);

CREATE INDEX pr_outreach_jobs_partner_status_idx
  ON public.pr_outreach_jobs (a2a_partner_id, status, created_at DESC);
