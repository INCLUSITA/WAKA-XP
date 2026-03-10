
CREATE TABLE public.channel_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  provider text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'not_configured',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  webhook_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, provider)
);

ALTER TABLE public.channel_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all select on channel_connections" ON public.channel_connections FOR SELECT TO public USING (true);
CREATE POLICY "Allow all insert on channel_connections" ON public.channel_connections FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow all update on channel_connections" ON public.channel_connections FOR UPDATE TO public USING (true);
CREATE POLICY "Allow all delete on channel_connections" ON public.channel_connections FOR DELETE TO public USING (true);

CREATE TRIGGER update_channel_connections_updated_at
  BEFORE UPDATE ON public.channel_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
