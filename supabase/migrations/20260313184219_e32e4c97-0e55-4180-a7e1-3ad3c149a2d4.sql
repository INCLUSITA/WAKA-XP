
CREATE TABLE public.player_saved_flows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'sandbox',
  conversation_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  scenario_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  data_mode text NOT NULL DEFAULT 'libre',
  source_id uuid DEFAULT NULL,
  source_name text DEFAULT NULL,
  message_count integer NOT NULL DEFAULT 0,
  created_by uuid DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.player_saved_flows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tenant saved flows"
  ON public.player_saved_flows FOR SELECT TO authenticated
  USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can insert tenant saved flows"
  ON public.player_saved_flows FOR INSERT TO authenticated
  WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can update tenant saved flows"
  ON public.player_saved_flows FOR UPDATE TO authenticated
  USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can delete tenant saved flows"
  ON public.player_saved_flows FOR DELETE TO authenticated
  USING (tenant_id = get_user_tenant_id(auth.uid()));
