import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

import { AuthShell } from "@/components/auth-shell";

export const Route = createFileRoute("/error")({
  head: () => ({
    meta: [
      { title: "發生未預期的錯誤 · Edgar Auth" },
      { name: "description", content: "系統暫時無法完成這次請求，請稍後再試；若持續發生請回報。" },
      { property: "og:title", content: "發生未預期的錯誤 · Edgar Auth" },
      {
        property: "og:description",
        content: "系統暫時無法完成這次請求，請稍後再試；若持續發生請回報。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GenericError,
});

function GenericError() {
  return (
    <AuthShell
      tone="danger"
      title="發生未預期的錯誤"
      description="系統暫時無法完成這次請求，請稍後再試；若持續發生請回報。"
      icon={<AlertTriangle className="h-8 w-8" aria-hidden="true" />}
    >
      <div className="flex flex-col gap-2">
        <Link
          to="/"
          className="inline-flex w-full items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-sm font-medium transition-colors"
        >
          回到首頁
        </Link>
      </div>
    </AuthShell>
  );
}
