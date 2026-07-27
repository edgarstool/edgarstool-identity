import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";

import { AuthShell } from "@/components/auth-shell";

export const Route = createFileRoute("/session-expired")({
  head: () => ({
    meta: [
      { title: "工作階段已過期 · Edgar Auth" },
      {
        name: "description",
        content: "為了保護你的帳號，閒置過久的工作階段（Session）已自動結束。",
      },
      { property: "og:title", content: "工作階段已過期 · Edgar Auth" },
      {
        property: "og:description",
        content: "為了保護你的帳號，閒置過久的工作階段（Session）已自動結束。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SessionExpired,
});

function SessionExpired() {
  return (
    <AuthShell
      tone="warning"
      title="工作階段已過期"
      description="為了保護你的帳號，閒置過久的工作階段（Session）已自動結束。"
      icon={<Clock className="h-8 w-8" aria-hidden="true" />}
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
