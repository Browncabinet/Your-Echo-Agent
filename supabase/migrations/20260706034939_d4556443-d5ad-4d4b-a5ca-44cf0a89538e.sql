CREATE TABLE public.mcp_settings (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mcp_settings TO authenticated;
GRANT ALL ON public.mcp_settings TO service_role;

ALTER TABLE public.mcp_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own MCP settings"
  ON public.mcp_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER mcp_settings_touch_updated_at
  BEFORE UPDATE ON public.mcp_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();