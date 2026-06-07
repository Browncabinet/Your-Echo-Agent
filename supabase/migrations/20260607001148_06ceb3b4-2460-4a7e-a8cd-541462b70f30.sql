
CREATE TABLE public.a2a_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid NOT NULL UNIQUE,
  billing_email text NOT NULL DEFAULT '',
  stripe_customer_id text,
  current_invoice_id text,
  balance_cents integer NOT NULL DEFAULT 0,
  total_spent_cents integer NOT NULL DEFAULT 0,
  auto_charge boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.a2a_partners TO service_role;
ALTER TABLE public.a2a_partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role only partners" ON public.a2a_partners FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.a2a_ledger
  ADD COLUMN IF NOT EXISTS billed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS billed_at timestamptz,
  ADD COLUMN IF NOT EXISTS billing_method text,
  ADD COLUMN IF NOT EXISTS stripe_invoice_item_id text;

CREATE INDEX IF NOT EXISTS idx_a2a_ledger_unbilled ON public.a2a_ledger(job_id) WHERE billed = false;
