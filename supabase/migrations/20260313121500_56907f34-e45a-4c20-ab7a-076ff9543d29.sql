
-- Tabla para definir "Entidades" de negocio (Ej: Cliente, Pedido)
CREATE TABLE public.experience_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experience_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id),
    name TEXT NOT NULL,
    entity_type TEXT NOT NULL DEFAULT 'custom',
    description TEXT,
    data_schema JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla para almacenar los VALORES del contexto en una ejecución real
CREATE TABLE public.experience_context_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experience_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE,
    run_id UUID REFERENCES public.flow_runs(id) ON DELETE CASCADE,
    entity_id UUID NOT NULL REFERENCES public.experience_entities(id) ON DELETE CASCADE,
    entity_data JSONB DEFAULT '{}'::jsonb,
    last_updated TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.experience_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_context_values ENABLE ROW LEVEL SECURITY;

-- RLS para experience_entities
CREATE POLICY "Users can view tenant entities"
ON public.experience_entities FOR SELECT
TO authenticated
USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can insert tenant entities"
ON public.experience_entities FOR INSERT
TO authenticated
WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can update tenant entities"
ON public.experience_entities FOR UPDATE
TO authenticated
USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can delete tenant entities"
ON public.experience_entities FOR DELETE
TO authenticated
USING (tenant_id = get_user_tenant_id(auth.uid()));

-- RLS para experience_context_values (via entity tenant)
CREATE POLICY "Users can view tenant context values"
ON public.experience_context_values FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.experience_entities e
  WHERE e.id = experience_context_values.entity_id
  AND e.tenant_id = get_user_tenant_id(auth.uid())
));

CREATE POLICY "Users can insert tenant context values"
ON public.experience_context_values FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.experience_entities e
  WHERE e.id = experience_context_values.entity_id
  AND e.tenant_id = get_user_tenant_id(auth.uid())
));

CREATE POLICY "Users can update tenant context values"
ON public.experience_context_values FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.experience_entities e
  WHERE e.id = experience_context_values.entity_id
  AND e.tenant_id = get_user_tenant_id(auth.uid())
));

-- Trigger updated_at
CREATE TRIGGER set_updated_at_experience_entities
  BEFORE UPDATE ON public.experience_entities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
