import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { AuthShell } from "@/components/auth-shell";
import { consumeTokensFromUrl, sanitizeNext, waitForSession } from "@/lib/auth";

export const Route = createFileRoute("/auth/confirm")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "確認電子郵件 · EDGAR'S Tools Identity" },
      { name: "description", content: "正在確認你的電子郵件並啟用 EDGAR'S Tools 帳戶。" },
      { property: "og:title", content: "確認電子郵件 · EDGAR'S Tools Identity" },
      { property: "og:description", content: "正在確認你的電子郵件並啟用 EDGAR'S Tools 帳戶。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthConfirmPage,
});

function AuthConfirmPage() {
  const [state, setState] = useState<"pending" | "failed">("pending");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const params = new URLSearchParams(window.location.search);
      if (params.get("error")) {
        window.location.replace("/auth/failed");
        return;
      }
      const next = sanitizeNext(params.get("next"));
      const session = (await consumeTokensFromUrl()) ?? (await waitForSession());
      if (cancelled) return;
      if (!session) {
        setState("failed");
        window.location.replace("/auth/failed");
        return;
      }
      window.location.replace(next ?? "/auth/success");
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthShell
      title={state === "failed" ? "驗證未完成" : "正在確認你的電子郵件…"}
      description="驗證連結僅能使用一次，若已過期請重新申請。"
      icon={<Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />}
    />
  );
}
