import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";

/** 共用的授權頁外框（Auth Shell）：置中卡片、統一品牌樣式 */
export function AuthShell({
  title,
  description,
  children,
  footer,
  icon,
  tone = "default",
}: {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  icon?: ReactNode;
  tone?: "default" | "success" | "danger" | "warning";
}) {
  const toneClass = {
    default: "text-primary",
    success: "text-emerald-500",
    danger: "text-destructive",
    warning: "text-amber-500",
  }[tone];

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          <span>Edgar Auth · 通用身分授權</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          {icon ? <div className={`mb-4 flex justify-center ${toneClass}`}>{icon}</div> : null}
          <h1 className="text-center text-xl font-semibold tracking-tight text-card-foreground">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 text-center text-sm text-muted-foreground">{description}</p>
          ) : null}
          {children ? <div className="mt-6">{children}</div> : null}
        </div>
        <div className="mt-6 text-center text-xs text-muted-foreground">
          {footer ?? (
            <Link to="/" className="underline underline-offset-4 hover:text-foreground">
              回到首頁
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
