
CREATE TABLE public.hunter_usage_daily (
  user_id uuid NOT NULL,
  day date NOT NULL DEFAULT (now()::date),
  lookups integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, day)
);

GRANT SELECT ON public.hunter_usage_daily TO authenticated;
GRANT ALL ON public.hunter_usage_daily TO service_role;

ALTER TABLE public.hunter_usage_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own hunter usage"
  ON public.hunter_usage_daily FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Global counter uses the zero uuid; everyone else's rows key on their own user_id.
CREATE OR REPLACE FUNCTION public.bump_hunter_usage(_user_id uuid, _amount integer DEFAULT 1)
RETURNS TABLE(user_lookups integer, global_lookups integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _today date := (now() AT TIME ZONE 'UTC')::date;
  _u integer;
  _g integer;
BEGIN
  INSERT INTO public.hunter_usage_daily (user_id, day, lookups, updated_at)
  VALUES (_user_id, _today, _amount, now())
  ON CONFLICT (user_id, day)
    DO UPDATE SET lookups = public.hunter_usage_daily.lookups + _amount, updated_at = now()
  RETURNING lookups INTO _u;

  INSERT INTO public.hunter_usage_daily (user_id, day, lookups, updated_at)
  VALUES ('00000000-0000-0000-0000-000000000000'::uuid, _today, _amount, now())
  ON CONFLICT (user_id, day)
    DO UPDATE SET lookups = public.hunter_usage_daily.lookups + _amount, updated_at = now()
  RETURNING lookups INTO _g;

  RETURN QUERY SELECT _u, _g;
END;
$$;
