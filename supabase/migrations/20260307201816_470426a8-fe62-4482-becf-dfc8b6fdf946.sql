
-- Workspaces table (one default per tenant, expandable later)
CREATE TABLE public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Default Studio',
  slug text NOT NULL DEFAULT 'default',
  description text,
  is_default boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all select on workspaces" ON public.workspaces FOR SELECT USING (true);
CREATE POLICY "Allow all insert on workspaces" ON public.workspaces FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on workspaces" ON public.workspaces FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on workspaces" ON public.workspaces FOR DELETE USING (true);

-- Experiences table
CREATE TABLE public.experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft',
  environment text NOT NULL DEFAULT 'draft',
  tags text[] NOT NULL DEFAULT '{}',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all select on experiences" ON public.experiences FOR SELECT USING (true);
CREATE POLICY "Allow all insert on experiences" ON public.experiences FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on experiences" ON public.experiences FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on experiences" ON public.experiences FOR DELETE USING (true);

-- Trigger for updated_at on workspaces
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for updated_at on experiences
CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON public.experiences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default workspace for demo tenant
INSERT INTO public.workspaces (tenant_id, name, slug, is_default)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Studio', 'default', true);

-- Add workspace_id to flows table for future use
ALTER TABLE public.flows ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES public.workspaces(id) ON DELETE SET NULL;
