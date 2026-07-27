import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { AuthShell } from "@/components/auth-shell";
import { consumeTokensFromUrl, sanitizeNext, waitForSession } from "@/lib/auth";

export const Route = createFileRoute("/callback")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "處理登入中 · Edgar Auth" },
      { name: "description", content: "正在完成 OAuth 登入流程並建立安全連線。" },
      { property: "og:title", content: "處理登入中 · Edgar Auth" },
      { property: "og:description", content: "正在完成 OAuth 登入流程並建立安全連線。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CallbackPage,
});

function CallbackPage() {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function finish() {
      const params = new URLSearchParams(window.location.search);
      let next: string | null = sanitizeNext(params.get("next"));
      try {
        next = next ?? sanitizeNext(sessionStorage.getItem("auth:next"));
        sessionStorage.removeItem("auth:next");
      } catch {
        /* 忽略 */
      }
      if (params.get("error")) {
        window.location.replace("/auth/failed");
        return;
      }
      // 先嘗試用網址上的權杖建立 Session，再退回輪詢
      const session = (await consumeTokensFromUrl()) ?? (await waitForSession());
      if (cancelled) return;
      if (!session) {
        setFailed(true);
        window.location.replace("/auth/failed");
        return;
      }
      window.location.replace(next ?? "/auth/success");
    }
    void finish();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthShell
      title={failed ? "登入未完成" : "正在完成登入…"}
      description={
        failed ? "即將導向失敗頁面。" : "請稍候，我們正在建立你的安全工作階段（Session）。"
      }
      icon={<Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />}
    />
  );
}
