import { createFileRoute, Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";

import { AuthShell } from "@/components/auth-shell";

export const Route = createFileRoute("/auth/failed")({
  head: () => ({
    meta: [
      { title: "驗證失敗 · Edgar Auth" },
      { name: "description", content: "登入或授權流程未完成，可能是逾時、被取消或憑證不正確。" },
      { property: "og:title", content: "驗證失敗 · Edgar Auth" },
      {
        property: "og:description",
        content: "登入或授權流程未完成，可能是逾時、被取消或憑證不正確。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthFailed,
});

function AuthFailed() {
  return (
    <AuthShell
      tone="danger"
      title="驗證失敗"
      description="登入或授權流程未完成，可能是逾時、被取消或憑證不正確。"
      icon={<XCircle className="h-8 w-8" aria-hidden="true" />}
    >
      <div className="flex flex-col gap-2">
        <Link
          to="/login"
          search={{ next: undefined }}
          className="inline-flex w-full items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-sm font-medium transition-colors"
        >
          重新登入
        </Link>
        <Link
          to="/"
          className="inline-flex w-full items-center justify-center rounded-md border border-input bg-background text-foreground hover:bg-accent px-4 py-2 text-sm font-medium transition-colors"
        >
          回到首頁
        </Link>
      </div>
    </AuthShell>
  );
}
