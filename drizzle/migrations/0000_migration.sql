CREATE TABLE public.free_tool_usage (
  ip_hash text NOT NULL,
  day date NOT NULL DEFAULT current_date,
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (ip_hash, day)
);
ALTER TABLE public.free_tool_usage ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.free_tool_usage FROM anon, authenticated;
GRANT ALL ON public.free_tool_usage TO service_role;

CREATE OR REPLACE FUNCTION public.bump_free_tool_usage(_ip_hash text, _limit integer)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c integer;
BEGIN
  INSERT INTO public.free_tool_usage (ip_hash, day, count) VALUES (_ip_hash, current_date, 1)
  ON CONFLICT (ip_hash, day) DO UPDATE SET count = free_tool_usage.count + 1
  WHERE free_tool_usage.count < _limit
  RETURNING count INTO c;
  RETURN COALESCE(c, -1);
END $$;
REVOKE EXECUTE ON FUNCTION public.bump_free_tool_usage(text, integer) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bump_free_tool_usage(text, integer) TO service_role;