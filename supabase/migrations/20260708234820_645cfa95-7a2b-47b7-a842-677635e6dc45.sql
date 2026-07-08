
REVOKE EXECUTE ON FUNCTION public.bump_hunter_usage(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bump_hunter_usage(uuid, integer) TO service_role;
