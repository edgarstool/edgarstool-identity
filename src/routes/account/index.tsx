import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppWindow, ShieldCheck, Terminal, UserCircle2 } from "lucide-react";

import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/account/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "我的帳戶 · EDGAR'S Tools Identity" },
      { name: "description", content: "檢視 EDGAR'S Tools 帳戶資訊、登入方式與授權管理。" },
      { property: "og:title", content: "我的帳戶 · EDGAR'S Tools Identity" },
      { property: "og:description", content: "檢視 EDGAR'S Tools 帳戶資訊、登入方式與授權管理。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/login", search: { next: "/account" } });
  },
  component: AccountPage,
});

type Info = { email: string; provider: string; lastSignIn: string; active: boolean };

function AccountPage() {
  const [info, setInfo] = useState<Info | null>(null);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return;
      setInfo({
        email: u.email ?? "（未提供）",
        provider: (u.app_metadata?.provider as string) ?? "email",
        lastSignIn: u.last_sign_in_at
          ? new Date(u.last_sign_in_at).toLocaleString("zh-TW")
          : "未知",
        active: true,
      });
    });
  }, []);

  const providerLabel: Record<string, string> = {
    google: "Google 帳號",
    email: "電子郵件與密碼",
  };

  return (
    <AuthShell
      title="我的帳戶"
      description="管理你的 EDGAR'S Tools 身分與應用程式授權。"
      icon={<UserCircle2 className="h-8 w-8" aria-hidden="true" />}
      footer={
        <span className="space-x-3">
          <Link to="/privacy" className="underline underline-offset-4 hover:text-foreground">
            隱私權政策
          </Link>
          <Link to="/terms" className="underline underline-offset-4 hover:text-foreground">
            服務條款
          </Link>
        </span>
      }
    >
      <div className="space-y-6">
        <dl className="space-y-3 rounded-lg border border-border bg-muted/40 p-4 text-sm">
          <Row label="電子郵件" value={info?.email ?? "載入中…"} />
          <Row
            label="登入方式"
            value={info ? (providerLabel[info.provider] ?? info.provider) : "載入中…"}
          />
          <Row label="最近登入時間" value={info?.lastSignIn ?? "載入中…"} />
          <Row label="工作階段狀態" value={info?.active ? "有效" : "載入中…"} />
        </dl>

        <div className="flex flex-col gap-2">
          <Link
            to="/account/security"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            安全性
          </Link>
          <Link
            to="/account/authorizations"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <AppWindow className="h-4 w-4" aria-hidden="true" />
            已連結的應用程式
          </Link>
          <Link
            to="/developer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <Terminal className="h-4 w-4" aria-hidden="true" />
            開發者主控台
          </Link>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.location.assign("/logout")}
          >
            登出
          </Button>
        </div>
      </div>
    </AuthShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-all text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}
