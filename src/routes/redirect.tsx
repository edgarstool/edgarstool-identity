import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { sanitizeNext } from "@/lib/auth";

export const Route = createFileRoute("/redirect")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "安全重新導向 · Edgar Auth" },
      { name: "description", content: "確認目的地後再安全地重新導向，避免開放重新導向風險。" },
      { property: "og:title", content: "安全重新導向 · Edgar Auth" },
      { property: "og:description", content: "確認目的地後再安全地重新導向。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    to: typeof s.to === "string" ? s.to : undefined,
  }),
  component: RedirectPage,
});

function RedirectPage() {
  const { to } = Route.useSearch();
  const safe = sanitizeNext(to ?? null);
  const [seconds, setSeconds] = useState(3);

  useEffect(() => {
    if (!safe) return;
    const timer = setInterval(() => setSeconds((s) => s - 1), 1000);
    const go = setTimeout(() => window.location.replace(safe), 3000);
    return () => {
      clearInterval(timer);
      clearTimeout(go);
    };
  }, [safe]);

  if (!safe) {
    return (
      <AuthShell
        tone="danger"
        title="無法重新導向"
        description="目的地網址不在允許清單內，已為你的安全阻擋這次跳轉。"
        icon={<ExternalLink className="h-8 w-8" aria-hidden="true" />}
      >
        <Button className="w-full" onClick={() => window.location.replace("/")}>
          回到首頁
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="正在安全重新導向"
      description={`${seconds} 秒後前往：${safe}`}
      icon={<ExternalLink className="h-8 w-8" aria-hidden="true" />}
    >
      <Button className="w-full" onClick={() => window.location.replace(safe)}>
        立即前往
      </Button>
    </AuthShell>
  );
}
