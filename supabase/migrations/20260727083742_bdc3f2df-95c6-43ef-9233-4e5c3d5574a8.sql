DROP POLICY IF EXISTS "Anyone can read system nodes" ON public.system_nodes;
DROP POLICY IF EXISTS "Anyone can read system edges" ON public.system_edges;
DROP POLICY IF EXISTS "Anyone can read projects" ON public.registry_projects;
DROP POLICY IF EXISTS "Anyone can read workflows" ON public.workflows;
DROP POLICY IF EXISTS "Anyone can read tools" ON public.tools;

CREATE POLICY "Authenticated can read system nodes" ON public.system_nodes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read system edges" ON public.system_edges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read projects" ON public.registry_projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read workflows" ON public.workflows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read tools" ON public.tools FOR SELECT TO authenticated USING (true);

REVOKE ALL ON public.system_nodes FROM anon;
REVOKE ALL ON public.system_edges FROM anon;
REVOKE ALL ON public.registry_projects FROM anon;
REVOKE ALL ON public.workflows FROM anon;
REVOKE ALL ON public.tools FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.system_nodes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.system_edges TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registry_projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflows TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tools TO authenticated;