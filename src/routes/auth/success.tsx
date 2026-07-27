import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

import { AuthShell } from "@/components/auth-shell";

export const Route = createFileRoute("/auth/success")({
  head: () => ({
    meta: [
      { title: "驗證成功 · Edgar Auth" },
      { name: "description", content: "你的身分已完成驗證，可以安全返回原本的應用程式。" },
      { property: "og:title", content: "驗證成功 · Edgar Auth" },
      { property: "og:description", content: "你的身分已完成驗證，可以安全返回原本的應用程式。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthSuccess,
});

function AuthSuccess() {
  return (
    <AuthShell
      tone="success"
      title="驗證成功"
      description="你的身分已完成驗證，可以安全返回原本的應用程式。"
      icon={<CheckCircle2 className="h-8 w-8" aria-hidden="true" />}
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
          登出
        </Link>
      </div>
    </AuthShell>
  );
}
