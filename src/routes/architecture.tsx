import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ArchitectureMap } from "@/components/architecture-map";
import { ReviewNote, SeededDataNote } from "@/components/review-note";
import { statusOrder } from "@/data/edgar-os";
import { StatusChip } from "@/components/status-chip";

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "架構地圖 — EDGAR-OS 控制中心" },
      {
        name: "description",
        content:
          "EDGAR-OS 的互動式系統地圖：本機主機、Cloudflare、MCP Gateway、Hermes、OpenClaw、Agent-KB、Obsidian、自動化、身分驗證與 GitHub。",
      },
      { property: "og:title", content: "架構地圖 — EDGAR-OS 控制中心" },
      {
        property: "og:description",
        content: "點選任一節點即可查看它的角色、負責範圍、連線關係與風險。",
      },
    ],
  }),
  component: ArchitecturePage,
});

function ArchitecturePage() {
  const hash = useRouterState({ select: (s) => s.location.hash });

  return (
    <AppShell title="架構地圖" subtitle="點選任一節點以開啟詳細資訊">
      <div className="space-y-5">
        <ReviewNote />

        <div className="flex flex-wrap items-center gap-2">
          {statusOrder.map((s) => (
            <StatusChip key={s} status={s} />
          ))}
          <span className="ml-auto flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <span className="inline-block w-8 border-t border-dashed border-status-unknown" />
            選用的基礎設施
          </span>
        </div>

        <div className="overflow-x-auto">
          <ArchitectureMap initialSelected={hash || undefined} />
        </div>

        <SeededDataNote />
      </div>
    </AppShell>
  );
}
