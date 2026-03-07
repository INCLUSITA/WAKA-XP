
-- Drop restrictive policies on flows and add permissive ones for anon access
DROP POLICY IF EXISTS "Users can view org flows" ON public.flows;
DROP POLICY IF EXISTS "Users can insert org flows" ON public.flows;
DROP POLICY IF EXISTS "Users can update org flows" ON public.flows;
DROP POLICY IF EXISTS "Users can delete org flows" ON public.flows;

CREATE POLICY "Allow all select on flows" ON public.flows FOR SELECT USING (true);
CREATE POLICY "Allow all insert on flows" ON public.flows FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on flows" ON public.flows FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on flows" ON public.flows FOR DELETE USING (true);
