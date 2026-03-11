
CREATE TABLE public.whatsapp_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  language text NOT NULL DEFAULT 'en',
  category text NOT NULL DEFAULT 'utility',
  body_text text NOT NULL DEFAULT '',
  parameter_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'approved',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, name, language)
);

ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tenant templates"
  ON public.whatsapp_templates FOR SELECT
  TO authenticated
  USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can insert tenant templates"
  ON public.whatsapp_templates FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can update tenant templates"
  ON public.whatsapp_templates FOR UPDATE
  TO authenticated
  USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can delete tenant templates"
  ON public.whatsapp_templates FOR DELETE
  TO authenticated
  USING (tenant_id = get_user_tenant_id(auth.uid()));
