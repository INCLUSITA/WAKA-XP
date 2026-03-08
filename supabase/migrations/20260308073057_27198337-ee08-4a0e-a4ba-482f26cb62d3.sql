
CREATE TABLE public.production_candidates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'candidate',
  environment text NOT NULL DEFAULT 'sandbox',
  experience_id uuid REFERENCES public.experiences(id) ON DELETE SET NULL,
  flow_id uuid REFERENCES public.flows(id) ON DELETE SET NULL,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.production_candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all select on production_candidates" ON public.production_candidates FOR SELECT USING (true);
CREATE POLICY "Allow all insert on production_candidates" ON public.production_candidates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on production_candidates" ON public.production_candidates FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on production_candidates" ON public.production_candidates FOR DELETE USING (true);

CREATE TRIGGER set_updated_at_production_candidates
  BEFORE UPDATE ON public.production_candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
