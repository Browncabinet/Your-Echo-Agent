
ALTER TABLE public.a2a_partners
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS use_case text,
  ADD COLUMN IF NOT EXISTS default_spending_cap_cents integer NOT NULL DEFAULT 2500,
  ADD COLUMN IF NOT EXISTS auto_recharge_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_recharge_threshold_cents integer NOT NULL DEFAULT 1000,
  ADD COLUMN IF NOT EXISTS auto_recharge_amount_cents integer NOT NULL DEFAULT 5000;
