import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { AppWindow } from "lucide-react";

import { AuthShell } from "@/components/auth-shell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/account/authorizations")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "已連結的應用程式 · EDGAR'S Tools Identity" },
      { name: "description", content: "檢視並撤銷已授權存取 EDGAR'S Tools 帳戶的應用程式。" },
      { property: "og:title", content: "已連結的應用程式 · EDGAR'S Tools Identity" },
      {
        property: "og:description",
        content: "檢視並撤銷已授權存取 EDGAR'S Tools 帳戶的應用程式。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/login", search: { next: "/account/authorizations" } });
  },
  component: AuthorizationsPage,
});

function AuthorizationsPage() {
  return (
    <AuthShell
      title="已連結的應用程式"
      description="這裡會列出已取得你帳戶授權的應用程式。"
      icon={<AppWindow className="h-8 w-8" aria-hidden="true" />}
      footer={
        <span className="space-x-3">
          <Link to="/account" className="underline underline-offset-4 hover:text-foreground">
            回到我的帳戶
          </Link>
          <Link
            to="/account/security"
            className="underline underline-offset-4 hover:text-foreground"
          >
            安全性
          </Link>
        </span>
      }
    >
      {/* 空狀態（Empty State）：身分提供者目前未公開列出／撤銷授權的 API */}
      <div className="rounded-lg border border-dashed border-border p-6 text-center">
        <p className="text-sm font-medium text-foreground">目前無法列出已連結的應用程式</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          身分提供者尚未提供可查詢或撤銷 OAuth 同意紀錄的 API。等該 API
          開放後，這個頁面會直接列出應用程式名稱、授權範圍與撤銷按鈕。
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          在此之前，若要立即中止某個應用程式的存取，請到「安全性」頁面登出其他所有裝置，或來信
          <a
            href="mailto:edgar@edgars.tools"
            className="ml-1 underline underline-offset-4 hover:text-foreground"
          >
            edgar@edgars.tools
          </a>
          。
        </p>
      </div>
    </AuthShell>
  );
}
