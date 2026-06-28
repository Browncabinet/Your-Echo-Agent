
-- Hide a2a_agents.owner_email and callback_url from the public/anon directory view.
-- The "Anyone can view active agents" policy stays, but column-level revokes
-- ensure these columns can never be selected by anon/authenticated.
REVOKE SELECT (owner_email, callback_url) ON public.a2a_agents FROM anon, authenticated, PUBLIC;
GRANT  SELECT (owner_email, callback_url) ON public.a2a_agents TO service_role;

-- Hide user_email_settings.smtp_password from authenticated reads.
-- Edge functions that need to send mail run as service_role and still have access.
REVOKE SELECT (smtp_password) ON public.user_email_settings FROM anon, authenticated, PUBLIC;
GRANT  SELECT (smtp_password) ON public.user_email_settings TO service_role;
