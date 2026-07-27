import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ExternalLink, Loader2, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "服務入口 — EDGAR-OS Control Center" },
      {
        name: "description",
        content:
          "登入後的服務導覽中心：集中管理 Cloudflare Access、Tunnel 與公開服務的入口連結與保護方式。",
      },
      { property: "og:title", content: "服務入口 — EDGAR-OS Control Center" },
      {
        property: "og:description",
        content: "集中管理 Cloudflare Zero Trust 後方的所有服務入口。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ServicesPage,
});

type Protection = "Cloudflare Access" | "Cloudflare Tunnel" | "Public" | "Unknown";

const protections: Protection[] = ["Cloudflare Access", "Cloudflare Tunnel", "Public", "Unknown"];

const protectionLabel: Record<Protection, string> = {
  "Cloudflare Access": "Cloudflare Access（身分閘門）",
  "Cloudflare Tunnel": "Cloudflare Tunnel（本地服務）",
  Public: "公開（無閘門）",
  Unknown: "未知",
};

const protectionStyle: Record<Protection, string> = {
  "Cloudflare Access": "border-status-active/40 bg-status-active/10 text-status-active",
  "Cloudflare Tunnel": "border-status-planning/40 bg-status-planning/10 text-status-planning",
  Public: "border-status-experimental/40 bg-status-experimental/10 text-status-experimental",
  Unknown: "border-status-unknown/40 bg-status-unknown/10 text-status-unknown",
};

type ServiceRow = {
  id: string;
  name: string;
  url: string;
  category: string;
  description: string | null;
  protection: string;
  sort_order: number;
  is_active: boolean;
};

type Draft = {
  name: string;
  url: string;
  category: string;
  description: string;
  protection: Protection;
  sort_order: string;
};

const emptyDraft: Draft = {
  name: "",
  url: "",
  category: "General",
  description: "",
  protection: "Cloudflare Access",
  sort_order: "0",
};

function ServicesPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ServiceRow[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!data.user) {
        navigate({ to: "/login", search: { next: "/services" } as never });
        return;
      }
      setChecking(false);
      await load();
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("services")
      .select("id,name,url,category,description,protection,sort_order,is_active")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) toast.error("讀取服務清單失敗：" + error.message);
    setRows((data as ServiceRow[]) ?? []);
    setLoading(false);
  }

  function openCreate() {
    setEditingId(null);
    setDraft({ ...emptyDraft, sort_order: String(rows.length) });
    setOpen(true);
  }

  function openEdit(row: ServiceRow) {
    setEditingId(row.id);
    setDraft({
      name: row.name,
      url: row.url,
      category: row.category,
      description: row.description ?? "",
      protection: (protections as string[]).includes(row.protection)
        ? (row.protection as Protection)
        : "Unknown",
      sort_order: String(row.sort_order),
    });
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft.name.trim() || !draft.url.trim()) {
      toast.error("服務名稱與網址為必填");
      return;
    }
    setSaving(true);
    const payload = {
      name: draft.name.trim(),
      url: draft.url.trim(),
      category: draft.category.trim() || "General",
      description: draft.description.trim() || null,
      protection: draft.protection,
      sort_order: Number(draft.sort_order) || 0,
    };

    if (editingId) {
      const { error } = await supabase.from("services").update(payload).eq("id", editingId);
      if (error) toast.error("更新失敗：" + error.message);
      else toast.success("已更新服務");
    } else {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setSaving(false);
        toast.error("登入狀態已失效，請重新登入");
        return;
      }
      const { error } = await supabase
        .from("services")
        .insert({ ...payload, user_id: auth.user.id });
      if (error) toast.error("新增失敗：" + error.message);
      else toast.success("已新增服務");
    }
    setSaving(false);
    setOpen(false);
    await load();
  }

  async function remove(row: ServiceRow) {
    const { error } = await supabase.from("services").delete().eq("id", row.id);
    if (error) {
      toast.error("刪除失敗：" + error.message);
      return;
    }
    toast.success(`已刪除「${row.name}」`);
    await load();
  }

  const grouped = rows.reduce<Record<string, ServiceRow[]>>((acc, r) => {
    (acc[r.category] ??= []).push(r);
    return acc;
  }, {});

  return (
    <AppShell title="服務入口" subtitle="登入後的導覽中心 — Cloudflare Zero Trust 後方的所有服務">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3 rounded-xl panel p-4">
          <ShieldCheck className="size-5 text-primary" />
          <p className="min-w-0 flex-1 text-sm text-muted-foreground">
            此頁只列出入口與保護方式，實際的存取控制由 Cloudflare Access 在邊緣執行。 記得為{" "}
            <code className="font-mono text-xs">/mcp</code>、
            <code className="font-mono text-xs">/authorize</code> 等路徑設定 Bypass。
          </p>
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="size-4" />
            新增服務
          </Button>
        </div>

        {(checking || loading) && (
          <div className="flex items-center gap-2 rounded-xl panel p-10 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            載入中…
          </div>
        )}

        {!checking && !loading && rows.length === 0 && (
          <div className="rounded-xl panel p-10 text-center">
            <h2 className="text-base font-semibold tracking-tight">尚未登記任何服務</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              先把常用的子網域加進來，例如 n8n.edgars.tools、auth.edgars.tools，
              並標註各自由哪一層保護。
            </p>
            <Button className="mt-5 gap-2" onClick={openCreate}>
              <Plus className="size-4" />
              新增第一個服務
            </Button>
          </div>
        )}

        {!checking &&
          !loading &&
          Object.entries(grouped).map(([category, items]) => (
            <section key={category} className="space-y-3">
              <h2 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {category}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((row) => {
                  const p = (
                    (protections as string[]).includes(row.protection) ? row.protection : "Unknown"
                  ) as Protection;
                  return (
                    <article key={row.id} className="flex flex-col rounded-xl panel p-5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-semibold tracking-tight">{row.name}</h3>
                        <span
                          className={cn(
                            "shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                            protectionStyle[p],
                          )}
                        >
                          {protectionLabel[p]}
                        </span>
                      </div>

                      <a
                        href={row.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 font-mono text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="size-3.5" />
                        {row.url}
                      </a>

                      {row.description && (
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                          {row.description}
                        </p>
                      )}

                      <div className="mt-4 flex gap-2 border-t border-border pt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => openEdit(row)}
                        >
                          <Pencil className="size-3.5" />
                          編輯
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-muted-foreground"
                          onClick={() => remove(row)}
                        >
                          <Trash2 className="size-3.5" />
                          刪除
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle>{editingId ? "編輯服務" : "新增服務"}</DialogTitle>
              <DialogDescription>
                登記一個入口連結與它的保護方式，僅你本人看得到。
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="svc-name">服務名稱</Label>
                <Input
                  id="svc-name"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="n8n 自動化"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="svc-url">網址</Label>
                <Input
                  id="svc-url"
                  value={draft.url}
                  onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                  placeholder="https://n8n.edgars.tools"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="svc-cat">分類</Label>
                  <Input
                    id="svc-cat"
                    value={draft.category}
                    onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                    placeholder="Automation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="svc-order">排序</Label>
                  <Input
                    id="svc-order"
                    type="number"
                    value={draft.sort_order}
                    onChange={(e) => setDraft({ ...draft, sort_order: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>保護方式</Label>
                <Select
                  value={draft.protection}
                  onValueChange={(v) => setDraft({ ...draft, protection: v as Protection })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {protections.map((p) => (
                      <SelectItem key={p} value={p}>
                        {protectionLabel[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="svc-desc">說明</Label>
                <Textarea
                  id="svc-desc"
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  placeholder="這個服務的用途、誰可以存取、注意事項"
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                取消
              </Button>
              <Button type="submit" disabled={saving} className="gap-2">
                {saving && <Loader2 className="size-4 animate-spin" />}
                儲存
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
