import { createFileRoute, Link } from "@tanstack/react-router";
import { Wrench } from "lucide-react";

import { AuthShell } from "@/components/auth-shell";

export const Route = createFileRoute("/maintenance")({
  head: () => ({
    meta: [
      { title: "系統維護中 · Edgar Auth" },
      {
        name: "description",
        content: "我們正在進行例行維護，服務將於稍後恢復，造成不便敬請見諒。",
      },
      { property: "og:title", content: "系統維護中 · Edgar Auth" },
      {
        property: "og:description",
        content: "我們正在進行例行維護，服務將於稍後恢復，造成不便敬請見諒。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Maintenance,
});

function Maintenance() {
  return (
    <AuthShell
      tone="warning"
      title="系統維護中"
      description="我們正在進行例行維護，服務將於稍後恢復，造成不便敬請見諒。"
      icon={<Wrench className="h-8 w-8" aria-hidden="true" />}
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
