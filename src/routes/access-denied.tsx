import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldX } from "lucide-react";

import { AuthShell } from "@/components/auth-shell";

export const Route = createFileRoute("/access-denied")({
  head: () => ({
    meta: [
      { title: "沒有存取權限 · Edgar Auth" },
      {
        name: "description",
        content: "你已登入，但這個帳號沒有存取此資源的權限。如需權限請聯絡管理員。",
      },
      { property: "og:title", content: "沒有存取權限 · Edgar Auth" },
      {
        property: "og:description",
        content: "你已登入，但這個帳號沒有存取此資源的權限。如需權限請聯絡管理員。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccessDenied,
});

function AccessDenied() {
  return (
    <AuthShell
      tone="danger"
      title="沒有存取權限"
      description="你已登入，但這個帳號沒有存取此資源的權限。如需權限請聯絡管理員。"
      icon={<ShieldX className="h-8 w-8" aria-hidden="true" />}
    >
      <div className="flex flex-col gap-2">
        <Link
          to="/"
          className="inline-flex w-full items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-sm font-medium transition-colors"
        >
          回到首頁
        </Link>
        <Link
          to="/logout"
          className="inline-flex w-full items-center justify-center rounded-md border border-input bg-background text-foreground hover:bg-accent px-4 py-2 text-sm font-medium transition-colors"
        >
          換一個帳號
        </Link>
      </div>
    </AuthShell>
  );
}
