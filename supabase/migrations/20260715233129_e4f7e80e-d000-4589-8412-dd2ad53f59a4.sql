ALTER TABLE public.discovered_opportunities
  ADD COLUMN IF NOT EXISTS approach text,
  ADD COLUMN IF NOT EXISTS approach_reason text,
  ADD COLUMN IF NOT EXISTS engagement_hint text,
  ADD COLUMN IF NOT EXISTS draft_subject text,
  ADD COLUMN IF NOT EXISTS draft_body text,
  ADD COLUMN IF NOT EXISTS draft_generated_at timestamptz;