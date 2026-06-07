
-- 1) email_replies extensions
ALTER TABLE public.email_replies
  ADD COLUMN IF NOT EXISTS intent_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS suggested_reply text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS auto_paused boolean NOT NULL DEFAULT false;

-- 2) reply_actions_log
CREATE TABLE IF NOT EXISTS public.reply_actions_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reply_id uuid NOT NULL,
  campaign_id text NOT NULL DEFAULT '',
  action text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reply_actions_log TO authenticated;
GRANT ALL ON public.reply_actions_log TO service_role;
ALTER TABLE public.reply_actions_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own reply actions" ON public.reply_actions_log
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 3) a2a_callbacks_log
CREATE TABLE IF NOT EXISTS public.a2a_callbacks_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid,
  api_key_id uuid,
  job_id uuid,
  event_type text NOT NULL,
  callback_url text NOT NULL DEFAULT '',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  response_status integer,
  response_body text NOT NULL DEFAULT '',
  delivered boolean NOT NULL DEFAULT false,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.a2a_callbacks_log TO authenticated;
GRANT ALL ON public.a2a_callbacks_log TO service_role;
ALTER TABLE public.a2a_callbacks_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "partners view own callbacks" ON public.a2a_callbacks_log
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.a2a_partners p WHERE p.id = a2a_callbacks_log.partner_id AND p.owner_user_id = auth.uid())
  );

-- 4) a2a_rate_buckets (minute-bucket counter)
CREATE TABLE IF NOT EXISTS public.a2a_rate_buckets (
  api_key_id uuid NOT NULL,
  window_start timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (api_key_id, window_start)
);
GRANT ALL ON public.a2a_rate_buckets TO service_role;
ALTER TABLE public.a2a_rate_buckets ENABLE ROW LEVEL SECURITY;

-- 5) domain_throttle
CREATE TABLE IF NOT EXISTS public.domain_throttle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  domain text NOT NULL,
  send_date date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  sends_today integer NOT NULL DEFAULT 0,
  daily_cap integer NOT NULL DEFAULT 50,
  last_sent_at timestamptz,
  UNIQUE (user_id, domain, send_date)
);
GRANT SELECT ON public.domain_throttle TO authenticated;
GRANT ALL ON public.domain_throttle TO service_role;
ALTER TABLE public.domain_throttle ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own throttle" ON public.domain_throttle
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 6) bounce_events
CREATE TABLE IF NOT EXISTS public.bounce_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  send_id uuid,
  lead_email text NOT NULL DEFAULT '',
  bounce_type text NOT NULL DEFAULT 'soft',
  reason text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.bounce_events TO authenticated;
GRANT ALL ON public.bounce_events TO service_role;
ALTER TABLE public.bounce_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own bounces" ON public.bounce_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 7) sender_warmup
CREATE TABLE IF NOT EXISTS public.sender_warmup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  domain text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  day_index integer NOT NULL DEFAULT 1,
  daily_limit integer NOT NULL DEFAULT 20,
  sent_today integer NOT NULL DEFAULT 0,
  last_sent_date date,
  UNIQUE (user_id, domain)
);
GRANT SELECT ON public.sender_warmup TO authenticated;
GRANT ALL ON public.sender_warmup TO service_role;
ALTER TABLE public.sender_warmup ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own warmup" ON public.sender_warmup
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 8) unsubscribes
CREATE TABLE IF NOT EXISTS public.unsubscribes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  source text NOT NULL DEFAULT 'link',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, email)
);
GRANT SELECT ON public.unsubscribes TO authenticated;
GRANT ALL ON public.unsubscribes TO service_role;
ALTER TABLE public.unsubscribes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own unsubscribes" ON public.unsubscribes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- helpful indexes
CREATE INDEX IF NOT EXISTS idx_reply_actions_user ON public.reply_actions_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_a2a_callbacks_partner ON public.a2a_callbacks_log(partner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_a2a_callbacks_job ON public.a2a_callbacks_log(job_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bounce_user ON public.bounce_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_domain_throttle_user ON public.domain_throttle(user_id, send_date DESC);
