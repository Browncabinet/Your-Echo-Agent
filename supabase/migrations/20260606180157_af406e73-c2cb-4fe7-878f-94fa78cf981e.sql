
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

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
SECURITY INVOKER
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
