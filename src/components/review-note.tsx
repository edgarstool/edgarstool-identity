import { ShieldCheck } from "lucide-react";
import { REVIEW_NOTE } from "@/data/edgar-os";
import { cn } from "@/lib/utils";

export function ReviewNote({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-primary/25 bg-primary/[0.06] px-4 py-3",
        className,
      )}
    >
      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
      <p className="text-sm leading-relaxed text-foreground/90">{REVIEW_NOTE}</p>
    </div>
  );
}

export function SeededDataNote({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      此清單由人工維護並儲存於後端資料庫，不含自動健康檢查。
    </p>
  );
}
