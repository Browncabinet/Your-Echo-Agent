REVOKE EXECUTE ON FUNCTION public.a2a_bump_rate(uuid, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.a2a_bump_rate(uuid, timestamptz) TO service_role;