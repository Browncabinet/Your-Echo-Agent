-- Revoke column-level SELECT on sensitive a2a_partners columns from client roles.
-- Service role retains full access via GRANT ALL.
REVOKE SELECT (webhook_secret, stripe_customer_id) ON public.a2a_partners FROM authenticated;
REVOKE SELECT (webhook_secret, stripe_customer_id) ON public.a2a_partners FROM anon;