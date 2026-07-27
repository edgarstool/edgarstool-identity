import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { uid } from "@/lib/local-store";
import { supabase } from "@/integrations/supabase/client";
import type { Status } from "@/data/edgar-os";

export type Lane = "Now" | "Next" | "Later" | "Inbox";
export const LANES: Lane[] = ["Now", "Next", "Later", "Inbox"];

export interface RoadmapItem {
  id: string;
  title: string;
  detail: string;
  lane: Lane;
  status: Status;
  project?: string;
}

export interface InboxItem {
  id: string;
  title: string;
  detail: string;
  source: string;
  archived: boolean;
  promoted: boolean;
  createdAt: string;
}

interface StoreValue {
  roadmap: RoadmapItem[];
  inbox: InboxItem[];
  /** 資料已從雲端載入完成 */
  hydrated: boolean;
  /** 尚未登入時為 null */
  userId: string | null;
  addRoadmap: (item: Omit<RoadmapItem, "id">) => Promise<void>;
  patchRoadmap: (id: string, patch: Partial<Omit<RoadmapItem, "id">>) => Promise<void>;
  removeRoadmap: (id: string) => Promise<void>;
  addInbox: (item: { title: string; detail: string; source?: string }) => Promise<void>;
  patchInbox: (
    id: string,
    patch: Partial<Pick<InboxItem, "archived" | "promoted" | "title" | "detail">>,
  ) => Promise<void>;
  reload: () => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

export function ControlCenterStoreProvider({ children }: { children: ReactNode }) {
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const uidValue = userData.user?.id ?? null;
    setUserId(uidValue);
    if (!uidValue) {
      setRoadmap([]);
      setInbox([]);
      setHydrated(true);
      return;
    }
    const [r, i] = await Promise.all([
      supabase
        .from("roadmap_items")
        .select("id, title, detail, lane, status, project")
        .order("created_at", { ascending: false }),
      supabase
        .from("inbox_items")
        .select("id, title, detail, source, archived, promoted, created_at")
        .order("created_at", { ascending: false }),
    ]);
    setRoadmap(
      (r.data ?? []).map((row) => ({
        id: row.id,
        title: row.title,
        detail: row.detail,
        lane: row.lane as Lane,
        status: row.status as Status,
        project: row.project ?? undefined,
      })),
    );
    setInbox(
      (i.data ?? []).map((row) => ({
        id: row.id,
        title: row.title,
        detail: row.detail,
        source: row.source,
        archived: row.archived,
        promoted: row.promoted,
        createdAt: (row.created_at ?? "").slice(0, 10),
      })),
    );
    setHydrated(true);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const addRoadmap = useCallback<StoreValue["addRoadmap"]>(
    async (item) => {
      if (!userId) return;
      const { data, error } = await supabase
        .from("roadmap_items")
        .insert({
          user_id: userId,
          title: item.title,
          detail: item.detail,
          lane: item.lane,
          status: item.status,
          project: item.project ?? null,
        })
        .select("id")
        .single();
      if (error || !data) return;
      setRoadmap((prev) => [{ ...item, id: data.id }, ...prev]);
    },
    [userId],
  );

  const patchRoadmap = useCallback<StoreValue["patchRoadmap"]>(async (id, patch) => {
    setRoadmap((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    await supabase.from("roadmap_items").update(patch).eq("id", id);
  }, []);

  const removeRoadmap = useCallback<StoreValue["removeRoadmap"]>(async (id) => {
    setRoadmap((prev) => prev.filter((r) => r.id !== id));
    await supabase.from("roadmap_items").delete().eq("id", id);
  }, []);

  const addInbox = useCallback<StoreValue["addInbox"]>(
    async (item) => {
      if (!userId) return;
      const { data, error } = await supabase
        .from("inbox_items")
        .insert({
          user_id: userId,
          title: item.title,
          detail: item.detail,
          source: item.source ?? "Manual capture",
        })
        .select("id, created_at")
        .single();
      if (error || !data) return;
      setInbox((prev) => [
        {
          id: data.id,
          title: item.title,
          detail: item.detail,
          source: item.source ?? "Manual capture",
          archived: false,
          promoted: false,
          createdAt: (data.created_at ?? "").slice(0, 10),
        },
        ...prev,
      ]);
    },
    [userId],
  );

  const patchInbox = useCallback<StoreValue["patchInbox"]>(async (id, patch) => {
    setInbox((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    await supabase.from("inbox_items").update(patch).eq("id", id);
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      roadmap,
      inbox,
      hydrated,
      userId,
      addRoadmap,
      patchRoadmap,
      removeRoadmap,
      addInbox,
      patchInbox,
      reload,
    }),
    [
      roadmap,
      inbox,
      hydrated,
      userId,
      addRoadmap,
      patchRoadmap,
      removeRoadmap,
      addInbox,
      patchInbox,
      reload,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useControlCenterStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useControlCenterStore must be used inside ControlCenterStoreProvider");
  return ctx;
}

export { uid };
