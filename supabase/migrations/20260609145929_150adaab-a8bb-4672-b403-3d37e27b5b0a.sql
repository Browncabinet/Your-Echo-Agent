-- Phase 1.3: idempotency for /hire endpoint
CREATE TABLE public.a2a_idempotency_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid NOT NULL REFERENCES public.a2a_api_keys(id) ON DELETE CASCADE,
  idempotency_key text NOT NULL,
  response_json jsonb NOT NULL,
  status_code integer NOT NULL DEFAULT 201,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (api_key_id, idempotency_key)
);

CREATE INDEX idx_a2a_idem_created ON public.a2a_idempotency_keys(created_at);

GRANT ALL ON public.a2a_idempotency_keys TO service_role;
-- no authenticated/anon grants: only edge functions touch this

ALTER TABLE public.a2a_idempotency_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role manages idempotency keys"
  ON public.a2a_idempotency_keys
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Phase 1.7: remove dead auto_charge column (never wired)
ALTER TABLE public.a2a_jobs DROP COLUMN IF EXISTS auto_charge;