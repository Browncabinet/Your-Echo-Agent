ALTER TABLE public.campaign_sends ADD COLUMN IF NOT EXISTS variant TEXT NULL;
CREATE INDEX IF NOT EXISTS campaign_sends_campaign_variant_idx ON public.campaign_sends (campaign_id, variant);