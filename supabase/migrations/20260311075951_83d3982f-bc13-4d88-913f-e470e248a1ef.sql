
-- Run status enum
CREATE TYPE public.run_status AS ENUM ('waiting', 'active', 'completed', 'expired', 'errored');

-- Flow runs table
CREATE TABLE public.flow_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id uuid REFERENCES public.flows(id) ON DELETE SET NULL,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  contact_urn text NOT NULL DEFAULT '',
  status public.run_status NOT NULL DEFAULT 'active',
  terminal_reason text,
  context_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Flow run steps table
CREATE TABLE public.flow_run_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.flow_runs(id) ON DELETE CASCADE,
  node_uuid text NOT NULL DEFAULT '',
  node_type text NOT NULL DEFAULT '',
  node_label text,
  input jsonb NOT NULL DEFAULT '{}'::jsonb,
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  elapsed_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.flow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_run_steps ENABLE ROW LEVEL SECURITY;

-- RLS: tenant-scoped access
CREATE POLICY "Users can view tenant runs"
  ON public.flow_runs FOR SELECT TO authenticated
  USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can insert tenant runs"
  ON public.flow_runs FOR INSERT TO authenticated
  WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can update tenant runs"
  ON public.flow_runs FOR UPDATE TO authenticated
  USING (tenant_id = get_user_tenant_id(auth.uid()));

-- Steps: access via run ownership
CREATE POLICY "Users can view tenant run steps"
  ON public.flow_run_steps FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.flow_runs r
    WHERE r.id = flow_run_steps.run_id
    AND r.tenant_id = get_user_tenant_id(auth.uid())
  ));

CREATE POLICY "Users can insert tenant run steps"
  ON public.flow_run_steps FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.flow_runs r
    WHERE r.id = flow_run_steps.run_id
    AND r.tenant_id = get_user_tenant_id(auth.uid())
  ));

-- updated_at trigger for flow_runs
CREATE TRIGGER set_flow_runs_updated_at
  BEFORE UPDATE ON public.flow_runs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for common queries
CREATE INDEX idx_flow_runs_tenant_status ON public.flow_runs(tenant_id, status);
CREATE INDEX idx_flow_run_steps_run_id ON public.flow_run_steps(run_id);
