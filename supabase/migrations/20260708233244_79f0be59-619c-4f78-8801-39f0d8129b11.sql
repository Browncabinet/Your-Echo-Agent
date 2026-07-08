
CREATE TABLE public.contact_enrichments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  opportunity_id uuid,
  first_name text NOT NULL,
  last_name text NOT NULL,
  domain text NOT NULL,
  email text,
  score int,
  verification text,
  sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  raw jsonb,
  charged_units numeric(6,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX contact_enrichments_key_idx
  ON public.contact_enrichments (lower(first_name), lower(last_name), lower(domain));
CREATE INDEX contact_enrichments_user_idx ON public.contact_enrichments (user_id, created_at DESC);

GRANT SELECT ON public.contact_enrichments TO authenticated;
GRANT ALL ON public.contact_enrichments TO service_role;

ALTER TABLE public.contact_enrichments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_read" ON public.contact_enrichments
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
