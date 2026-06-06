
-- A2A API Keys (partner agents hiring our agents)
CREATE TABLE public.a2a_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash text NOT NULL UNIQUE,
  key_prefix text NOT NULL,
  owner_email text NOT NULL,
  owner_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  rate_limit_per_min integer NOT NULL DEFAULT 60,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz
);
GRANT ALL ON public.a2a_api_keys TO service_role;
ALTER TABLE public.a2a_api_keys ENABLE ROW LEVEL SECURITY;

-- A2A Agent Registry (the agents available to hire)
CREATE TABLE public.a2a_agents (
  agent_id text PRIMARY KEY,
  name text NOT NULL,
  tagline text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  niche text NOT NULL DEFAULT '',
  persona text NOT NULL DEFAULT '',
  capabilities jsonb NOT NULL DEFAULT '[]'::jsonb,
  pricing_per_lead_cents integer NOT NULL DEFAULT 10,
  pricing_per_reply_cents integer NOT NULL DEFAULT 50,
  pricing_per_meeting_cents integer NOT NULL DEFAULT 500,
  rating numeric(3,2) NOT NULL DEFAULT 5.0,
  jobs_completed integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  version text NOT NULL DEFAULT '1.0.0',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.a2a_agents TO anon, authenticated;
GRANT ALL ON public.a2a_agents TO service_role;
ALTER TABLE public.a2a_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active agents" ON public.a2a_agents
  FOR SELECT TO anon, authenticated USING (active = true);

-- A2A Jobs (hire requests)
CREATE TABLE public.a2a_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL REFERENCES public.a2a_agents(agent_id),
  api_key_id uuid REFERENCES public.a2a_api_keys(id),
  user_id uuid,
  campaign_id uuid,
  source text NOT NULL DEFAULT 'a2a',
  status text NOT NULL DEFAULT 'queued',
  callback_url text,
  sender_identity jsonb NOT NULL DEFAULT '{}'::jsonb,
  request jsonb NOT NULL DEFAULT '{}'::jsonb,
  results_summary jsonb NOT NULL DEFAULT '{"leads":0,"emails_sent":0,"replies":0,"meetings":0}'::jsonb,
  spend_cents integer NOT NULL DEFAULT 0,
  spending_cap_cents integer NOT NULL DEFAULT 2500,
  estimated_cost_cents integer NOT NULL DEFAULT 0,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.a2a_jobs TO authenticated;
GRANT ALL ON public.a2a_jobs TO service_role;
ALTER TABLE public.a2a_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own jobs" ON public.a2a_jobs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE INDEX a2a_jobs_user_idx ON public.a2a_jobs(user_id);
CREATE INDEX a2a_jobs_api_key_idx ON public.a2a_jobs(api_key_id);
CREATE INDEX a2a_jobs_status_idx ON public.a2a_jobs(status);

-- A2A Ledger (per-result billing events)
CREATE TABLE public.a2a_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.a2a_jobs(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  unit_cost_cents integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.a2a_ledger TO authenticated;
GRANT ALL ON public.a2a_ledger TO service_role;
ALTER TABLE public.a2a_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own ledger" ON public.a2a_ledger
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.a2a_jobs j WHERE j.id = job_id AND j.user_id = auth.uid())
  );
CREATE INDEX a2a_ledger_job_idx ON public.a2a_ledger(job_id);

-- updated_at triggers
CREATE TRIGGER touch_a2a_agents BEFORE UPDATE ON public.a2a_agents
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_a2a_jobs BEFORE UPDATE ON public.a2a_jobs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed agents (matches marketplace cards)
INSERT INTO public.a2a_agents (agent_id, name, tagline, description, niche, persona, capabilities, pricing_per_lead_cents, pricing_per_reply_cents) VALUES
('saas-prospector', 'SaaS Prospector', 'B2B SaaS lead generation', 'Finds decision-makers at SaaS companies and writes personalized cold emails referencing their product, recent funding, or growth signals.', 'B2B SaaS', 'A sharp, friendly SDR who studied the prospect''s website and LinkedIn before reaching out.', '["email_outreach","lead_research","linkedin_assist"]'::jsonb, 15, 75),
('agency-closer', 'Agency Closer', 'Marketing agency outreach', 'Targets agency owners and CMOs with case-study driven emails optimized for booking discovery calls.', 'Marketing Agencies', 'A confident agency growth consultant who leads with results, not features.', '["email_outreach","lead_research","linkedin_assist"]'::jsonb, 12, 60),
('ecom-hunter', 'Ecom Hunter', 'DTC & ecommerce brands', 'Finds Shopify and DTC brands hitting growth milestones and pitches relevant services.', 'Ecommerce / DTC', 'A pragmatic ecom growth partner who speaks in CAC, AOV, and LTV.', '["email_outreach","lead_research"]'::jsonb, 10, 50),
('founder-friend', 'Founder Friend', 'Warm intros for founders', 'Personalized outreach for early-stage founders raising or hiring — warm, human, no-pitch first email.', 'Startups / Founders', 'A peer founder reaching out genuinely, not selling.', '["email_outreach","linkedin_assist"]'::jsonb, 20, 100),
('local-pro', 'Local Pro', 'Service businesses & local', 'Targets local service businesses (clinics, gyms, salons, contractors) with offer-driven outreach.', 'Local Services', 'A no-nonsense local marketing rep who promises measurable results.', '["email_outreach"]'::jsonb, 8, 40),
('press-pitcher', 'Press Pitcher', 'PR & journalist outreach', 'Pitches journalists, podcasters, and newsletter editors with story angles tailored to their beat.', 'PR & Media', 'A seasoned publicist who reads the journalist''s recent work before pitching.', '["email_outreach","lead_research"]'::jsonb, 25, 125);
