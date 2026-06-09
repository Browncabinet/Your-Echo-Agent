-- Webhook retry queue (DLQ)
CREATE TABLE public.a2a_callback_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  callback_log_id uuid REFERENCES public.a2a_callbacks_log(id) ON DELETE SET NULL,
  partner_id uuid,
  api_key_id uuid,
  job_id uuid,
  callback_url text NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  signature text NOT NULL,
  attempt int NOT NULL DEFAULT 1,
  max_attempts int NOT NULL DEFAULT 5,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  last_status_code int,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_a2a_cbq_next ON public.a2a_callback_queue(status, next_attempt_at) WHERE status = 'pending';
CREATE INDEX idx_a2a_cbq_partner ON public.a2a_callback_queue(partner_id, created_at DESC);

GRANT SELECT ON public.a2a_callback_queue TO authenticated;
GRANT ALL ON public.a2a_callback_queue TO service_role;

ALTER TABLE public.a2a_callback_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "partner reads own queue"
  ON public.a2a_callback_queue FOR SELECT TO authenticated
  USING (
    partner_id IN (SELECT id FROM public.a2a_partners WHERE owner_user_id = auth.uid())
  );

CREATE POLICY "service role manages queue"
  ON public.a2a_callback_queue FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Job event timeline
CREATE TABLE public.a2a_job_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.a2a_jobs(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_a2a_jobevents_job ON public.a2a_job_events(job_id, created_at DESC);

GRANT SELECT ON public.a2a_job_events TO authenticated;
GRANT ALL ON public.a2a_job_events TO service_role;

ALTER TABLE public.a2a_job_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads own job events"
  ON public.a2a_job_events FOR SELECT TO authenticated
  USING (
    job_id IN (SELECT id FROM public.a2a_jobs WHERE user_id = auth.uid())
  );

CREATE POLICY "service role manages job events"
  ON public.a2a_job_events FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Agent ratings
CREATE TABLE public.a2a_agent_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL REFERENCES public.a2a_agents(agent_id) ON DELETE CASCADE,
  job_id uuid NOT NULL UNIQUE REFERENCES public.a2a_jobs(id) ON DELETE CASCADE,
  partner_id uuid,
  api_key_id uuid,
  rated_by_user_id uuid,
  stars int NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_a2a_ratings_agent ON public.a2a_agent_ratings(agent_id);

GRANT SELECT ON public.a2a_agent_ratings TO authenticated, anon;
GRANT ALL ON public.a2a_agent_ratings TO service_role;

ALTER TABLE public.a2a_agent_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ratings are public read"
  ON public.a2a_agent_ratings FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "service role manages ratings"
  ON public.a2a_agent_ratings FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Per-partner webhook secret
ALTER TABLE public.a2a_partners ADD COLUMN IF NOT EXISTS webhook_secret text;
-- Backfill secrets for existing partners
UPDATE public.a2a_partners
   SET webhook_secret = encode(gen_random_bytes(32), 'hex')
 WHERE webhook_secret IS NULL;

-- Agent ownership
ALTER TABLE public.a2a_agents ADD COLUMN IF NOT EXISTS owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.a2a_agents ADD COLUMN IF NOT EXISTS callback_url text;
ALTER TABLE public.a2a_agents ADD COLUMN IF NOT EXISTS owner_email text;

-- Allow partner self-registration: authenticated users can INSERT their own draft agents
GRANT SELECT, INSERT ON public.a2a_agents TO authenticated;
CREATE POLICY "owner can read own draft agents"
  ON public.a2a_agents FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid() OR active = true);
CREATE POLICY "owner can insert draft agents"
  ON public.a2a_agents FOR INSERT TO authenticated
  WITH CHECK (owner_user_id = auth.uid() AND active = false);

-- Atomic rate-limit bump
CREATE OR REPLACE FUNCTION public.a2a_bump_rate(_api_key_id uuid, _window_start timestamptz)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count int;
BEGIN
  INSERT INTO public.a2a_rate_buckets (api_key_id, window_start, count)
  VALUES (_api_key_id, _window_start, 1)
  ON CONFLICT (api_key_id, window_start)
    DO UPDATE SET count = public.a2a_rate_buckets.count + 1
  RETURNING count INTO _count;
  RETURN _count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.a2a_bump_rate(uuid, timestamptz) TO service_role;