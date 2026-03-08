
CREATE TABLE public.uploaded_demos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '🤖',
  color TEXT NOT NULL DEFAULT '#3B82F6',
  tags TEXT[] NOT NULL DEFAULT '{}',
  jsx_source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'stable',
  source_id TEXT,
  source_name TEXT,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.uploaded_demos ENABLE ROW LEVEL SECURITY;

-- Public read access (no auth required for demos)
CREATE POLICY "Anyone can read demos" ON public.uploaded_demos
  FOR SELECT USING (true);

-- Public insert/update/delete (since this app doesn't require auth for demo management)
CREATE POLICY "Anyone can insert demos" ON public.uploaded_demos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update demos" ON public.uploaded_demos
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete demos" ON public.uploaded_demos
  FOR DELETE USING (true);
