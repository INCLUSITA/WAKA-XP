
-- 1. Rename the table
ALTER TABLE public.organizations RENAME TO tenants;

-- 2. Rename columns on referencing tables from org_id → tenant_id
ALTER TABLE public.flows RENAME COLUMN org_id TO tenant_id;
ALTER TABLE public.globals RENAME COLUMN org_id TO tenant_id;
ALTER TABLE public.profiles RENAME COLUMN org_id TO tenant_id;
ALTER TABLE public.webhook_logs RENAME COLUMN org_id TO tenant_id;

-- 3. Create function get_user_tenant_id as replacement
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(_user_id uuid)
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = _user_id
$$;

-- 4. Update old function to use new column name (backward compat)
CREATE OR REPLACE FUNCTION public.get_user_org_id(_user_id uuid)
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = _user_id
$$;

-- 5. Drop and recreate RLS policies on tenants table
DROP POLICY IF EXISTS "Users can view their org" ON public.tenants;
CREATE POLICY "Users can view their tenant"
  ON public.tenants FOR SELECT
  USING (id = get_user_tenant_id(auth.uid()));

-- Allow admins to manage tenants
CREATE POLICY "Admins can manage tenants"
  ON public.tenants FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- 6. Update RLS policies on flows (currently open, let's keep them open for now)
-- flows already has permissive "true" policies, no column name references to update

-- 7. Update RLS policies on globals to use tenant_id
DROP POLICY IF EXISTS "Users can delete org globals" ON public.globals;
DROP POLICY IF EXISTS "Users can insert org globals" ON public.globals;
DROP POLICY IF EXISTS "Users can update org globals" ON public.globals;
DROP POLICY IF EXISTS "Users can view org globals" ON public.globals;

CREATE POLICY "Users can view tenant globals"
  ON public.globals FOR SELECT
  USING (tenant_id = get_user_tenant_id(auth.uid()));
CREATE POLICY "Users can insert tenant globals"
  ON public.globals FOR INSERT
  WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()));
CREATE POLICY "Users can update tenant globals"
  ON public.globals FOR UPDATE
  USING (tenant_id = get_user_tenant_id(auth.uid()));
CREATE POLICY "Users can delete tenant globals"
  ON public.globals FOR DELETE
  USING (tenant_id = get_user_tenant_id(auth.uid()));

-- 8. Update RLS policies on webhook_logs
DROP POLICY IF EXISTS "Users can insert org webhook logs" ON public.webhook_logs;
DROP POLICY IF EXISTS "Users can view org webhook logs" ON public.webhook_logs;

CREATE POLICY "Users can view tenant webhook logs"
  ON public.webhook_logs FOR SELECT
  USING (tenant_id = get_user_tenant_id(auth.uid()));
CREATE POLICY "Users can insert tenant webhook logs"
  ON public.webhook_logs FOR INSERT
  WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()));

-- 9. Update RLS on flow_versions (references flows which has open policies, no change needed)

-- 10. Add display_name and branding columns to tenants for management UI
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#6366f1';
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Africa/Ouagadougou';
