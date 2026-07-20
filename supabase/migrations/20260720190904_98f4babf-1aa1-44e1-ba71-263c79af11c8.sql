
-- Registered referrer agents (optional richer mode)
CREATE TABLE public.referral_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  agent_card_url text,
  payout_destination jsonb NOT NULL DEFAULT '{}'::jsonb,
  contact_email text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.referral_agents TO authenticated;
GRANT ALL ON public.referral_agents TO service_role;
ALTER TABLE public.referral_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage their referrer agents"
  ON public.referral_agents FOR ALL TO authenticated
  USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

CREATE TRIGGER referral_agents_touch BEFORE UPDATE ON public.referral_agents
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Referral codes (opaque, shareable, work with or without login)
CREATE TABLE public.referral_codes (
  code text PRIMARY KEY,
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  referrer_agent_id uuid REFERENCES public.referral_agents(id) ON DELETE SET NULL,
  label text,
  clicks int NOT NULL DEFAULT 0,
  conversions int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.referral_codes TO anon;
GRANT SELECT, INSERT, UPDATE ON public.referral_codes TO authenticated;
GRANT ALL ON public.referral_codes TO service_role;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
-- Anon can read a code row (used to look up a code by URL / show its label). No PII exposed.
CREATE POLICY "Public can read codes"
  ON public.referral_codes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Owners can update their own codes"
  ON public.referral_codes FOR UPDATE TO authenticated
  USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

-- Conversion log — the source of truth for attribution ("track only, no payout yet")
CREATE TABLE public.referral_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_code text REFERENCES public.referral_codes(code) ON DELETE SET NULL,
  referrer_agent_id uuid REFERENCES public.referral_agents(id) ON DELETE SET NULL,
  attributed_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  agent_id text,
  task_id text,
  event_type text NOT NULL DEFAULT 'hire',
  amount_cents int NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL DEFAULT 'tracked_only',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.referral_conversions TO authenticated;
GRANT ALL ON public.referral_conversions TO service_role;
ALTER TABLE public.referral_conversions ENABLE ROW LEVEL SECURITY;
-- A referrer sees conversions attributed to their code (via ownership) or to their registered agent
CREATE POLICY "Referrers see their own conversions"
  ON public.referral_conversions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.referral_codes c
      WHERE c.code = referral_conversions.referrer_code
        AND c.owner_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.referral_agents a
      WHERE a.id = referral_conversions.referrer_agent_id
        AND a.owner_user_id = auth.uid()
    )
  );

CREATE INDEX referral_conversions_code_idx ON public.referral_conversions(referrer_code);
CREATE INDEX referral_conversions_agent_idx ON public.referral_conversions(referrer_agent_id);
CREATE INDEX referral_conversions_created_idx ON public.referral_conversions(created_at DESC);
