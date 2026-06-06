
ALTER TABLE public.a2a_jobs
  ADD COLUMN IF NOT EXISTS leads_total integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS leads_sent integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS daily_send_cap integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS last_event text,
  ADD COLUMN IF NOT EXISTS last_event_at timestamptz,
  ADD COLUMN IF NOT EXISTS paused_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_run_at timestamptz;

CREATE TABLE IF NOT EXISTS public.a2a_byo_smtp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL UNIQUE,
  smtp_host text NOT NULL,
  smtp_port integer NOT NULL DEFAULT 587,
  smtp_username text NOT NULL,
  smtp_password text NOT NULL,
  from_email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.a2a_byo_smtp TO service_role;

ALTER TABLE public.a2a_byo_smtp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role only byo smtp"
  ON public.a2a_byo_smtp FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);
