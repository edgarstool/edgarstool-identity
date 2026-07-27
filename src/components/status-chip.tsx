import type { Status, Maturity } from "@/data/edgar-os";
import { cn } from "@/lib/utils";

/** 狀態的繁體中文顯示名稱（資料庫仍存英文列舉值） */
export const statusLabels: Record<Status, string> = {
  Active: "進行中",
  Planning: "規劃中",
  Paused: "暫停",
  Experimental: "實驗性",
  Deprecated: "已淘汰",
  Unknown: "未知",
};

/** 成熟度（Maturity）的繁體中文顯示名稱 */
export const maturityLabels: Record<Maturity, string> = {
  Formal: "正式",
  Experiment: "實驗",
  Deprecated: "已淘汰",
  Unknown: "未知",
};

const statusStyles: Record<Status, string> = {
  Active: "border-status-active/40 bg-status-active/10 text-status-active",
  Planning: "border-status-planning/40 bg-status-planning/10 text-status-planning",
  Paused: "border-status-paused/40 bg-status-paused/10 text-status-paused",
  Experimental: "border-status-experimental/40 bg-status-experimental/10 text-status-experimental",
  Deprecated: "border-status-deprecated/40 bg-status-deprecated/10 text-status-deprecated",
  Unknown: "border-status-unknown/40 bg-status-unknown/10 text-status-unknown",
};

export function StatusChip({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        statusStyles[status],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {statusLabels[status]}
    </span>
  );
}

const maturityStyles: Record<Maturity, string> = {
  Formal: "border-primary/40 bg-primary/10 text-primary",
  Experiment: "border-status-experimental/40 bg-status-experimental/10 text-status-experimental",
  Deprecated: "border-status-deprecated/40 bg-status-deprecated/10 text-status-deprecated",
  Unknown: "border-border bg-muted/40 text-muted-foreground",
};

export function MaturityChip({ maturity }: { maturity: Maturity }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest",
        maturityStyles[maturity],
      )}
    >
      {maturityLabels[maturity]}
    </span>
  );
}
