
ALTER TABLE public.a2a_partners
  ADD COLUMN IF NOT EXISTS owner_user_id uuid,
  ADD COLUMN IF NOT EXISTS pending_credit_cents integer NOT NULL DEFAULT 0;

GRANT SELECT ON public.a2a_partners TO authenticated;

CREATE POLICY "Owners view own partner" ON public.a2a_partners
  FOR SELECT TO authenticated USING (owner_user_id = auth.uid());

-- expose api key linkage to owner
ALTER TABLE public.a2a_api_keys ADD COLUMN IF NOT EXISTS owner_user_id uuid;
GRANT SELECT ON public.a2a_api_keys TO authenticated;
ALTER TABLE public.a2a_api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners view own api keys" ON public.a2a_api_keys
  FOR SELECT TO authenticated USING (owner_user_id = auth.uid());
