import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, GitBranch, ArrowRightCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ReviewNote, SeededDataNote } from "@/components/review-note";
import { MaturityChip, StatusChip, statusLabels } from "@/components/status-chip";
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
import { useRegistry } from "@/lib/registry";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "專案清單 — EDGAR-OS 控制中心" },
      {
        name: "description",
        content:
          "列出每一個 EDGAR-OS 專案的狀態、目的、相依項目、權威 Repo、下一步行動，以及它屬於正式、實驗、已淘汰或未知。",
      },
      { property: "og:title", content: "專案清單 — EDGAR-OS 控制中心" },
      {
        property: "og:description",
        content: "EDGAR-OS 專案的唯一權威清單，透過審閱維護，而非靠對話。",
      },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const [filter, setFilter] = useState<Status | "All">("All");
  const { projects, isAdmin, updateProject } = useRegistry();
  const visible = projects.filter((p) => filter === "All" || p.status === filter);

  return (
    <AppShell title="專案清單" subtitle="每個專案只有一筆權威紀錄 — 重複即是錯誤">
      <div className="space-y-5">
        <ReviewNote />

        <div className="flex flex-wrap gap-2">
          {(["All", ...statusOrder] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                filter === s
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {s === "All" ? "全部" : statusLabels[s]}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((p) => (
            <article
              key={p.id}
              id={p.id}
              className="flex scroll-mt-24 flex-col rounded-xl panel p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-base font-semibold tracking-tight">{p.name}</h2>
                {isAdmin ? (
                  <Select
                    value={p.status}
                    onValueChange={(v) => void updateProject(p.id, { status: v as Status })}
                  >
                    <SelectTrigger className="h-7 w-32 text-xs">
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
                ) : (
                  <StatusChip status={p.status} />
                )}
              </div>

              <div className="mt-2">
                <MaturityChip maturity={p.maturity} />
              </div>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.purpose}</p>

              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    相依項目
                  </dt>
                  <dd className="mt-1 flex flex-wrap gap-1.5">
                    {p.dependencies.map((d) => (
                      <span
                        key={d}
                        className="rounded border border-border bg-surface-2/60 px-2 py-0.5 text-xs text-foreground/80"
                      >
                        {d}
                      </span>
                    ))}
                  </dd>
                </div>

                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    權威 Repo／路徑
                  </dt>
                  {isAdmin ? (
                    <dd className="mt-1">
                      <Input
                        value={p.repo}
                        onChange={(e) => void updateProject(p.id, { repo: e.target.value })}
                        className="h-8 font-mono text-xs"
                        aria-label="權威 Repo"
                      />
                    </dd>
                  ) : (
                    <dd
                      className={cn(
                        "mt-1 flex items-center gap-1.5 font-mono text-xs",
                        p.repoKnown ? "text-foreground/85" : "text-status-unknown",
                      )}
                    >
                      {p.repoKnown ? (
                        <GitBranch className="size-3.5" />
                      ) : (
                        <AlertTriangle className="size-3.5" />
                      )}
                      {p.repo}
                    </dd>
                  )}
                </div>

                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    下一步行動
                  </dt>
                  {isAdmin ? (
                    <dd className="mt-1">
                      <Textarea
                        value={p.nextAction}
                        onChange={(e) => void updateProject(p.id, { nextAction: e.target.value })}
                        rows={2}
                        className="min-h-0 text-sm"
                        aria-label="下一步行動"
                      />
                    </dd>
                  ) : (
                    <dd className="mt-1 flex gap-2 text-foreground/90">
                      <ArrowRightCircle className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      {p.nextAction}
                    </dd>
                  )}
                </div>
              </dl>

              {isAdmin ? (
                <Textarea
                  value={p.notes}
                  onChange={(e) => void updateProject(p.id, { notes: e.target.value })}
                  rows={2}
                  className="mt-4 min-h-0 text-xs"
                  aria-label="備註"
                />
              ) : (
                <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                  {p.notes}
                </p>
              )}
            </article>
          ))}
        </div>

        {visible.length === 0 && (
          <div className="rounded-xl panel p-10 text-center">
            <p className="text-sm text-muted-foreground">
              沒有狀態為「{filter === "All" ? "全部" : statusLabels[filter]}」的專案。
            </p>
            <Button variant="outline" className="mt-4" onClick={() => setFilter("All")}>
              清除篩選
            </Button>
          </div>
        )}

        <SeededDataNote />
      </div>
    </AppShell>
  );
}
