CREATE TABLE public.llm_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  tenant_id uuid REFERENCES public.tenants(id),
  model text NOT NULL DEFAULT 'gpt-5.2',
  latency_ms integer NOT NULL DEFAULT 0,
  prompt_tokens integer NOT NULL DEFAULT 0,
  completion_tokens integer NOT NULL DEFAULT 0,
  total_tokens integer NOT NULL DEFAULT 0,
  estimated_cost_usd numeric(10,6) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'success',
  error_message text,
  tool_calls_count integer NOT NULL DEFAULT 0,
  iteration_count integer NOT NULL DEFAULT 1,
  flow_id uuid,
  session_id text
);

ALTER TABLE public.llm_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view logs" ON public.llm_usage_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can insert logs" ON public.llm_usage_logs FOR INSERT WITH CHECK (true);

CREATE INDEX idx_llm_usage_logs_created_at ON public.llm_usage_logs(created_at DESC);
CREATE INDEX idx_llm_usage_logs_model ON public.llm_usage_logs(model);
CREATE INDEX idx_llm_usage_logs_tenant ON public.llm_usage_logs(tenant_id);