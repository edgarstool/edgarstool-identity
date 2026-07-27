import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Loader2, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ReviewNote } from "@/components/review-note";
import { StatusChip, statusLabels } from "@/components/status-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { statusOrder, type Status } from "@/data/edgar-os";
import { LANES, useControlCenterStore, type Lane } from "@/lib/store";

/** 軌道（Lane）的繁體中文顯示名稱 */
const laneLabels: Record<Lane, string> = {
  Now: "現在",
  Next: "接下來",
  Later: "之後",
  Inbox: "收件匣",
};

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "路線圖 — EDGAR-OS 控制中心" },
      {
        name: "description",
        content: "EDGAR-OS 工作的「現在／接下來／之後／收件匣」四個軌道，資料儲存在你的帳號中。",
      },
      { property: "og:title", content: "路線圖 — EDGAR-OS 控制中心" },
      {
        property: "og:description",
        content: "為 EDGAR-OS 的全貌排出順序，避免產生互相平行的計畫。",
      },
    ],
  }),
  component: RoadmapPage,
});

function RoadmapPage() {
  const { roadmap, hydrated, userId, addRoadmap, patchRoadmap, removeRoadmap } =
    useControlCenterStore();
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [lane, setLane] = useState<Lane>("Next");
  const [status, setStatus] = useState<Status>("Planning");

  const add = () => {
    if (!title.trim()) return;
    void addRoadmap({ title: title.trim(), detail: detail.trim(), lane, status });
    setTitle("");
    setDetail("");
  };

  const move = (id: string, dir: -1 | 1) => {
    const item = roadmap.find((r) => r.id === id);
    if (!item) return;
    const idx = Math.min(LANES.length - 1, Math.max(0, LANES.indexOf(item.lane) + dir));
    void patchRoadmap(id, { lane: LANES[idx] });
  };

  const update = (id: string, patch: Partial<{ title: string; detail: string }>) =>
    void patchRoadmap(id, patch);

  const remove = (id: string) => void removeRoadmap(id);

  if (!hydrated) {
    return (
      <AppShell title="路線圖" subtitle="正在從雲端載入…">
        <div className="flex items-center gap-2 rounded-xl panel p-10 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> 載入中…
        </div>
      </AppShell>
    );
  }

  if (!userId) {
    return (
      <AppShell title="路線圖" subtitle="需要登入才能存取你的路線圖">
        <div className="rounded-xl panel p-10 text-center text-sm text-muted-foreground">
          <p>你的路線圖資料存放在雲端帳號中。</p>
          <Link
            to="/login"
            search={{ next: "/roadmap" } as never}
            className="mt-4 inline-block underline underline-offset-4 hover:text-foreground"
          >
            前往登入
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="路線圖" subtitle="現在／接下來／之後／收件匣 — 儲存於你的雲端帳號">
      <div className="space-y-5">
        <ReviewNote />

        <div className="rounded-xl panel p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            新增項目
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-[2fr_2fr_auto_auto_auto]">
            <Input
              placeholder="標題"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
            />
            <Input
              placeholder="說明（選填）"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
            />
            <Select value={lane} onValueChange={(v) => setLane(v as Lane)}>
              <SelectTrigger className="lg:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANES.map((l) => (
                  <SelectItem key={l} value={l}>
                    {laneLabels[l]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
              <SelectTrigger className="lg:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOrder.map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={add} className="gap-2">
              <Plus className="size-4" /> 新增
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            已儲存於雲端資料庫，僅你本人可見；AI 客戶端透過 MCP 讀寫的也是同一份資料。
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
          {LANES.map((l) => {
            const items = hydrated ? roadmap.filter((r) => r.lane === l) : [];
            return (
              <section key={l} className="rounded-xl panel p-4">
                <header className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold tracking-tight">{laneLabels[l]}</h2>
                  <span className="font-mono text-xs text-muted-foreground">{items.length}</span>
                </header>

                <div className="mt-3 space-y-3">
                  {items.length === 0 && (
                    <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                      這個軌道還沒有項目
                    </p>
                  )}
                  {items.map((r) => (
                    <article
                      key={r.id}
                      className="rounded-lg border border-border bg-surface-2/55 p-3"
                    >
                      <input
                        value={r.title}
                        onChange={(e) => update(r.id, { title: e.target.value })}
                        className="w-full bg-transparent text-sm font-medium outline-none focus:text-primary"
                        aria-label="項目標題"
                      />
                      <Textarea
                        value={r.detail}
                        onChange={(e) => update(r.id, { detail: e.target.value })}
                        placeholder="說明"
                        className="mt-2 min-h-0 resize-none border-0 bg-transparent p-0 text-xs leading-snug text-muted-foreground shadow-none focus-visible:ring-0"
                        rows={3}
                        aria-label="項目說明"
                      />
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <StatusChip status={r.status} />
                        {r.project && (
                          <span className="max-w-[9rem] truncate font-mono text-[10px] text-muted-foreground">
                            {r.project}
                          </span>
                        )}
                        <div className="ml-auto flex shrink-0 items-center gap-1">
                          <IconBtn
                            label="往左移"
                            onClick={() => move(r.id, -1)}
                            disabled={LANES.indexOf(r.lane) === 0}
                          >
                            <ChevronLeft className="size-3.5" />
                          </IconBtn>
                          <IconBtn
                            label="往右移"
                            onClick={() => move(r.id, 1)}
                            disabled={LANES.indexOf(r.lane) === LANES.length - 1}
                          >
                            <ChevronRight className="size-3.5" />
                          </IconBtn>
                          <IconBtn label="刪除" onClick={() => remove(r.id)}>
                            <Trash2 className="size-3.5" />
                          </IconBtn>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-6 place-items-center rounded border border-border text-muted-foreground transition-colors hover:text-primary disabled:opacity-30"
    >
      {children}
    </button>
  );
}
