
-- 1. subscriptions table
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  stripe_subscription_id text NOT NULL UNIQUE,
  stripe_customer_id text NOT NULL,
  product_id text NOT NULL,
  price_id text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  environment text NOT NULL DEFAULT 'sandbox',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);

GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- 2. weekly_usage table
CREATE TABLE public.weekly_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  week_start date NOT NULL,
  emails_sent integer NOT NULL DEFAULT 0,
  linkedin_actions integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);

CREATE INDEX idx_weekly_usage_user_week ON public.weekly_usage(user_id, week_start);

GRANT SELECT ON public.weekly_usage TO authenticated;
GRANT ALL ON public.weekly_usage TO service_role;

ALTER TABLE public.weekly_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON public.weekly_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages usage"
  ON public.weekly_usage FOR ALL
  USING (auth.role() = 'service_role');

-- 3. caps lookup function
CREATE OR REPLACE FUNCTION public.current_week_caps(_user_id uuid)
RETURNS TABLE (
  tier text,
  email_cap integer,
  linkedin_cap integer,
  emails_used integer,
  linkedin_used integer,
  week_start date,
  subscription_active boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _price_id text;
  _status text;
  _period_end timestamptz;
  _week_start date := date_trunc('week', now())::date;
  _email_cap integer := 0;
  _linkedin_cap integer := 0;
  _tier text := 'none';
  _active boolean := false;
BEGIN
  SELECT s.price_id, s.status, s.current_period_end
    INTO _price_id, _status, _period_end
  FROM public.subscriptions s
  WHERE s.user_id = _user_id
  ORDER BY s.created_at DESC
  LIMIT 1;

  IF _price_id IS NOT NULL AND (
    (_status IN ('active','trialing','past_due') AND (_period_end IS NULL OR _period_end > now()))
    OR (_status = 'canceled' AND _period_end IS NOT NULL AND _period_end > now())
  ) THEN
    _active := true;
    IF _price_id = 'starter_weekly' THEN
      _tier := 'starter'; _email_cap := 500; _linkedin_cap := 50;
    ELSIF _price_id = 'growth_weekly' THEN
      _tier := 'growth'; _email_cap := 1500; _linkedin_cap := 150;
    ELSIF _price_id = 'power_weekly' THEN
      _tier := 'power'; _email_cap := 4000; _linkedin_cap := 400;
    END IF;
  END IF;

  RETURN QUERY
  SELECT
    _tier,
    _email_cap,
    _linkedin_cap,
    COALESCE((SELECT u.emails_sent FROM public.weekly_usage u WHERE u.user_id = _user_id AND u.week_start = _week_start), 0),
    COALESCE((SELECT u.linkedin_actions FROM public.weekly_usage u WHERE u.user_id = _user_id AND u.week_start = _week_start), 0),
    _week_start,
    _active;
END;
$$;

GRANT EXECUTE ON FUNCTION public.current_week_caps(uuid) TO authenticated, service_role;

-- 4. updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_subscriptions_updated
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_weekly_usage_updated
  BEFORE UPDATE ON public.weekly_usage
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
