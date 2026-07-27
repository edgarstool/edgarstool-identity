import { createFileRoute, Link } from "@tanstack/react-router";
import { Gauge } from "lucide-react";

import { AuthShell } from "@/components/auth-shell";

export const Route = createFileRoute("/rate-limited")({
  head: () => ({
    meta: [
      { title: "請求過於頻繁 · Edgar Auth" },
      { name: "description", content: "偵測到短時間內大量請求，請稍候片刻再試一次。" },
      { property: "og:title", content: "請求過於頻繁 · Edgar Auth" },
      { property: "og:description", content: "偵測到短時間內大量請求，請稍候片刻再試一次。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RateLimited,
});

function RateLimited() {
  return (
    <AuthShell
      tone="warning"
      title="請求過於頻繁"
      description="偵測到短時間內大量請求，請稍候片刻再試一次。"
      icon={<Gauge className="h-8 w-8" aria-hidden="true" />}
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
