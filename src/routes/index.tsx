import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CircleDot, Target } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ReviewNote, SeededDataNote } from "@/components/review-note";
import { StatusChip } from "@/components/status-chip";
import { currentFocus, statusOrder, type Status } from "@/data/edgar-os";
import { useControlCenterStore } from "@/lib/store";
import { useRegistry } from "@/lib/registry";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EdgarsTools — EDGAR-OS 控制中心" },
      {
        name: "description",
        content:
          "EdgarsTools 是個人作業系統 EDGAR-OS 的中央指揮儀表板。使用 Google 登入後，即可在同一處管理系統地圖、專案、路線圖、收件匣與服務入口。",
      },
      { property: "og:title", content: "EdgarsTools — EDGAR-OS 控制中心" },
      {
        property: "og:description",
        content:
          "EDGAR-OS 的中央儀表板：系統地圖、專案、路線圖、收件匣與服務入口。Google 登入僅用於識別帳號與保護你的資料。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { roadmap, inbox } = useControlCenterStore();
  const { projects, systems, tools, workflows } = useRegistry();
  const counts = statusOrder.map((s) => ({
    status: s,
    count: projects.filter((p) => p.status === s).length,
  }));
  const now = roadmap.filter((r) => r.lane === "Now");
  const openInbox = inbox.filter((i) => !i.archived && !i.promoted);

  return (
    <AppShell title="全景儀表板" subtitle="一個畫面看完整個 EDGAR-OS">
      <div className="space-y-6">
        <section className="rounded-xl border border-primary/20 bg-primary/5 p-5">
          <h1 className="text-lg font-semibold tracking-tight">EdgarsTools — EDGAR-OS 控制中心</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            這是 Edgar 個人作業系統 EDGAR-OS
            的中央指揮儀表板（Dashboard）。登入後可統一管理系統地圖、專案清單、路線圖、收件匣與各項服務入口。使用
            Google 登入純粹為了識別帳號並保護你的個人資料，不會用於廣告或分享給第三方。
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            This is the central command dashboard for the EDGAR-OS personal operating system. After
            signing in, you can manage your system map, projects, roadmap, inbox and service portal
            in one place. Google sign-in is used only to identify your account and protect your data
            — never for ads or shared with third parties.
          </p>
        </section>

        <ReviewNote />

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl panel p-5 lg:col-span-2">
            <div className="flex items-center gap-2 text-primary">
              <Target className="size-4" />
              <span className="font-mono text-[10px] uppercase tracking-widest">目前焦點</span>
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">{currentFocus.headline}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {currentFocus.detail}
            </p>
            <ul className="mt-4 space-y-2">
              {currentFocus.guardrails.map((g) => (
                <li key={g} className="flex gap-2 text-sm text-foreground/85">
                  <CircleDot className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  {g}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              {currentFocus.focusProjectIds.map((id) => {
                const p = projects.find((x) => x.id === id);
                if (!p) return null;
                return (
                  <Link
                    key={id}
                    to="/projects"
                    hash={id}
                    className="rounded-md border border-border bg-surface-2/60 px-3 py-1.5 text-xs transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    {p.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl panel p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              專案狀態總覽
            </div>
            <div className="mt-4 space-y-3">
              {counts.map(({ status, count }) => (
                <div key={status} className="flex items-center gap-3">
                  <StatusChip status={status} />
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className={barClass(status)}
                      style={{
                        width: `${(count / projects.length) * 100 || 2}%`,
                      }}
                    />
                  </div>
                  <span className="w-5 text-right font-mono text-sm">{count}</span>
                </div>
              ))}
            </div>
            <SeededDataNote className="mt-4" />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl panel p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                運作中的系統
              </div>
              <Link
                to="/architecture"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                開啟地圖 <ArrowRight className="size-3" />
              </Link>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {systems
                .filter((s) => s.status !== "Deprecated")
                .map((s) => (
                  <Link
                    key={s.id}
                    to="/architecture"
                    hash={s.id}
                    className="rounded-lg border border-border bg-surface-2/50 p-3 transition-colors hover:border-primary/50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{s.name}</span>
                      <StatusChip status={s.status} />
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{s.summary}</p>
                  </Link>
                ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl panel p-5">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  現在
                </div>
                <Link to="/roadmap" className="text-xs text-primary hover:underline">
                  路線圖
                </Link>
              </div>
              <ul className="mt-3 space-y-2">
                {now.length === 0 && (
                  <li className="text-sm text-muted-foreground">「現在」軌道目前沒有項目。</li>
                )}
                {now.map((r) => (
                  <li key={r.id} className="text-sm">
                    <span className="text-foreground">{r.title}</span>
                    <span className="block text-xs text-muted-foreground">{r.project}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl panel p-5">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  收件匣
                </div>
                <Link to="/inbox" className="text-xs text-primary hover:underline">
                  記錄點子
                </Link>
              </div>
              <p className="mt-3 text-3xl font-semibold">{openInbox.length}</p>
              <p className="text-xs text-muted-foreground">個點子正在等待審閱，之後才會成為專案</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl panel p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              工作流程
            </div>
            <ul className="mt-3 divide-y divide-border">
              {workflows.map((w) => (
                <li key={w.id} className="flex items-start gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{w.name}</p>
                    <p className="text-xs text-muted-foreground">{w.summary}</p>
                  </div>
                  <StatusChip status={w.status} className="ml-auto shrink-0" />
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl panel p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              工具
            </div>
            <ul className="mt-3 divide-y divide-border">
              {tools.map((t) => (
                <li key={t.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.usedFor}</p>
                  </div>
                  <StatusChip status={t.status} className="ml-auto shrink-0" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function barClass(status: Status) {
  const map: Record<Status, string> = {
    Active: "bg-status-active",
    Planning: "bg-status-planning",
    Paused: "bg-status-paused",
    Experimental: "bg-status-experimental",
    Deprecated: "bg-status-deprecated",
    Unknown: "bg-status-unknown",
  };
  return `h-full rounded-full ${map[status]}`;
}
