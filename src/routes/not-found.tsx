import { createFileRoute, Link } from "@tanstack/react-router";
import { SearchX } from "lucide-react";

import { AuthShell } from "@/components/auth-shell";

export const Route = createFileRoute("/not-found")({
  head: () => ({
    meta: [
      { title: "找不到頁面 · Edgar Auth" },
      { name: "description", content: "這個網址不存在或已被移動。" },
      { property: "og:title", content: "找不到頁面 · Edgar Auth" },
      { property: "og:description", content: "這個網址不存在或已被移動。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <AuthShell
      tone="default"
      title="找不到頁面"
      description="這個網址不存在或已被移動。"
      icon={<SearchX className="h-8 w-8" aria-hidden="true" />}
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
