import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  projects as seedProjects,
  systemEdges as seedEdges,
  systems as seedSystems,
  tools as seedTools,
  workflows as seedWorkflows,
  type Maturity,
  type Project,
  type Status,
  type SystemEdge,
  type SystemLayer,
  type SystemNode,
  type Tool,
  type Workflow,
} from "@/data/edgar-os";

interface RegistryValue {
  systems: SystemNode[];
  systemEdges: SystemEdge[];
  projects: Project[];
  workflows: Workflow[];
  tools: Tool[];
  /** 已從資料庫載入完成 */
  loaded: boolean;
  /** 目前使用者是否為管理員（可編輯登錄內容） */
  isAdmin: boolean;
  updateProject: (id: string, patch: Partial<Project>) => Promise<void>;
  reload: () => Promise<void>;
}

const RegistryContext = createContext<RegistryValue | null>(null);

export function RegistryProvider({ children }: { children: ReactNode }) {
  const [systems, setSystems] = useState<SystemNode[]>(seedSystems);
  const [systemEdges, setSystemEdges] = useState<SystemEdge[]>(seedEdges);
  const [projects, setProjects] = useState<Project[]>(seedProjects);
  const [workflows, setWorkflows] = useState<Workflow[]>(seedWorkflows);
  const [tools, setTools] = useState<Tool[]>(seedTools);
  const [loaded, setLoaded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const reload = useCallback(async () => {
    const [n, e, p, w, t] = await Promise.all([
      supabase.from("system_nodes").select("*").order("y"),
      supabase.from("system_edges").select("*").order("created_at"),
      supabase.from("registry_projects").select("*").order("created_at"),
      supabase.from("workflows").select("*").order("created_at"),
      supabase.from("tools").select("*").order("created_at"),
    ]);

    if (n.data?.length)
      setSystems(
        n.data.map((r) => ({
          id: r.id,
          name: r.name,
          layer: r.layer as SystemLayer,
          status: r.status as Status,
          optional: r.optional,
          summary: r.summary,
          role: r.role,
          owns: r.owns ?? [],
          doesNotOwn: r.does_not_own ?? [],
          location: r.location,
          risks: r.risks ?? [],
          x: Number(r.x),
          y: Number(r.y),
        })),
      );
    if (e.data?.length)
      setSystemEdges(
        e.data.map((r) => ({
          from: r.from_id,
          to: r.to_id,
          label: r.label,
          kind: r.kind as SystemEdge["kind"],
        })),
      );
    if (p.data?.length)
      setProjects(
        p.data.map((r) => ({
          id: r.id,
          name: r.name,
          status: r.status as Status,
          maturity: r.maturity as Maturity,
          purpose: r.purpose,
          dependencies: r.dependencies ?? [],
          repo: r.repo,
          repoKnown: r.repo_known,
          nextAction: r.next_action,
          notes: r.notes,
        })),
      );
    if (w.data?.length)
      setWorkflows(
        w.data.map((r) => ({
          id: r.id,
          name: r.name,
          status: r.status as Status,
          trigger: r.trigger,
          summary: r.summary,
          systems: r.systems ?? [],
        })),
      );
    if (t.data?.length)
      setTools(
        t.data.map((r) => ({
          id: r.id,
          name: r.name,
          category: r.category,
          status: r.status as Status,
          usedFor: r.used_for,
        })),
      );

    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!role);
    } else {
      setIsAdmin(false);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const updateProject = useCallback<RegistryValue["updateProject"]>(async (id, patch) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    await supabase
      .from("registry_projects")
      .update({
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.status !== undefined ? { status: patch.status } : {}),
        ...(patch.maturity !== undefined ? { maturity: patch.maturity } : {}),
        ...(patch.purpose !== undefined ? { purpose: patch.purpose } : {}),
        ...(patch.repo !== undefined ? { repo: patch.repo } : {}),
        ...(patch.repoKnown !== undefined ? { repo_known: patch.repoKnown } : {}),
        ...(patch.nextAction !== undefined ? { next_action: patch.nextAction } : {}),
        ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
      })
      .eq("id", id);
  }, []);

  const value = useMemo<RegistryValue>(
    () => ({
      systems,
      systemEdges,
      projects,
      workflows,
      tools,
      loaded,
      isAdmin,
      updateProject,
      reload,
    }),
    [systems, systemEdges, projects, workflows, tools, loaded, isAdmin, updateProject, reload],
  );

  return <RegistryContext.Provider value={value}>{children}</RegistryContext.Provider>;
}

export function useRegistry() {
  const ctx = useContext(RegistryContext);
  if (!ctx) throw new Error("useRegistry must be used inside RegistryProvider");
  return ctx;
}
