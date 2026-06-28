
-- Opportunities discovered for the user
CREATE TABLE IF NOT EXISTS public.discovered_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  campaign_id uuid,
  kind text NOT NULL CHECK (kind IN ('group','conference','webinar','podcast')),
  title text NOT NULL,
  url text NOT NULL,
  host_org text,
  location text,
  is_virtual boolean NOT NULL DEFAULT false,
  event_start timestamptz,
  event_end timestamptz,
  source text,
  contacts jsonb NOT NULL DEFAULT '[]'::jsonb,
  fit_score integer NOT NULL DEFAULT 0,
  fit_reason text,
  dedup_hash text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS discovered_opportunities_user_dedup_idx
  ON public.discovered_opportunities (user_id, dedup_hash);
CREATE INDEX IF NOT EXISTS discovered_opportunities_user_kind_idx
  ON public.discovered_opportunities (user_id, kind, event_start);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.discovered_opportunities TO authenticated;
GRANT ALL ON public.discovered_opportunities TO service_role;

ALTER TABLE public.discovered_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own opportunities select" ON public.discovered_opportunities
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own opportunities insert" ON public.discovered_opportunities
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own opportunities update" ON public.discovered_opportunities
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own opportunities delete" ON public.discovered_opportunities
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Radar: items the user has saved/attending/etc.
CREATE TABLE IF NOT EXISTS public.radar_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  opportunity_id uuid NOT NULL REFERENCES public.discovered_opportunities(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'saved' CHECK (status IN ('saved','attending','contacted','dismissed')),
  notes text,
  remind_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS radar_items_user_idx ON public.radar_items (user_id, status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.radar_items TO authenticated;
GRANT ALL ON public.radar_items TO service_role;

ALTER TABLE public.radar_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own radar select" ON public.radar_items
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own radar insert" ON public.radar_items
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own radar update" ON public.radar_items
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own radar delete" ON public.radar_items
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- weekly_usage: add discoveries_used if missing
ALTER TABLE public.weekly_usage
  ADD COLUMN IF NOT EXISTS discoveries_used integer NOT NULL DEFAULT 0;
