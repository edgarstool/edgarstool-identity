import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound, Loader2, Monitor, ShieldCheck } from "lucide-react";

import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/account/security")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "安全性 · EDGAR'S Tools Identity" },
      {
        name: "description",
        content: "管理 EDGAR'S Tools 帳戶的登入方式、目前工作階段與登入紀錄。",
      },
      { property: "og:title", content: "安全性 · EDGAR'S Tools Identity" },
      { property: "og:description", content: "管理登入方式、目前工作階段與登入紀錄。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/login", search: { next: "/account/security" } });
  },
  component: SecurityPage,
});

type SessionInfo = {
  email: string;
  provider: string;
  expiresAt: string;
  lastSignIn: string;
  hasPassword: boolean;
};

const providerLabel: Record<string, string> = {
  google: "Google 帳號",
  email: "電子郵件與密碼",
};

function SecurityPage() {
  const [info, setInfo] = useState<SessionInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      const u = s?.user;
      if (!u) return;
      const identities = u.identities ?? [];
      setInfo({
        email: u.email ?? "（未提供）",
        provider: (u.app_metadata?.provider as string) ?? "email",
        expiresAt: s?.expires_at ? new Date(s.expires_at * 1000).toLocaleString("zh-TW") : "未知",
        lastSignIn: u.last_sign_in_at
          ? new Date(u.last_sign_in_at).toLocaleString("zh-TW")
          : "未知",
        hasPassword: identities.some((i) => i.provider === "email"),
      });
    });
  }, []);

  async function sendPasswordReset() {
    if (!info) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const { error } = await supabase.auth.resetPasswordForEmail(info.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) return setError(error.message);
    setNotice("重設密碼信件已寄出，請至信箱完成設定。");
  }

  async function signOutOthers() {
    setBusy(true);
    setError(null);
    setNotice(null);
    const { error } = await supabase.auth.signOut({ scope: "others" });
    setBusy(false);
    if (error) return setError(error.message);
    setNotice("已登出其他裝置上的工作階段。");
  }

  return (
    <AuthShell
      title="安全性"
      description="檢視登入方式、目前的工作階段與登入紀錄。"
      icon={<ShieldCheck className="h-8 w-8" aria-hidden="true" />}
      footer={
        <span className="space-x-3">
          <Link to="/account" className="underline underline-offset-4 hover:text-foreground">
            回到我的帳戶
          </Link>
          <Link
            to="/account/authorizations"
            className="underline underline-offset-4 hover:text-foreground"
          >
            已連結的應用程式
          </Link>
        </span>
      }
    >
      <div className="space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-foreground">登入方式</h2>
          <dl className="mt-2 space-y-3 rounded-lg border border-border bg-muted/40 p-4 text-sm">
            <Row label="電子郵件" value={info?.email ?? "載入中…"} />
            <Row
              label="主要登入方式"
              value={info ? (providerLabel[info.provider] ?? info.provider) : "載入中…"}
            />
            <Row
              label="是否已設定密碼"
              value={info ? (info.hasPassword ? "已設定" : "尚未設定") : "載入中…"}
            />
          </dl>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            disabled={busy || !info}
            onClick={sendPasswordReset}
          >
            {busy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <KeyRound className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            {info?.hasPassword ? "寄送重設密碼信" : "設定密碼（寄送設定信）"}
          </Button>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-foreground">工作階段（Sessions）</h2>
          <div className="mt-2 rounded-lg border border-border bg-muted/40 p-4 text-sm">
            <div className="flex items-start gap-3">
              <Monitor className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">目前這個瀏覽器</p>
                <p className="mt-1 text-muted-foreground">
                  最近登入：{info?.lastSignIn ?? "載入中…"}
                </p>
                <p className="text-muted-foreground">權杖到期：{info?.expiresAt ?? "載入中…"}</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              身分提供者尚未開放列出其他裝置的工作階段清單，因此這裡只顯示目前這一個。你仍然可以一次登出所有其他裝置。
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            disabled={busy}
            onClick={signOutOthers}
          >
            登出其他所有裝置
          </Button>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-foreground">登入紀錄（Login History）</h2>
          <div className="mt-2 rounded-lg border border-dashed border-border p-4 text-sm">
            <p className="font-medium text-foreground">目前只保留最近一次登入</p>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              身分提供者尚未提供可查詢的登入事件紀錄 API。等該 API 開放後，這裡會列出時間、IP
              與裝置資訊。
            </p>
            <p className="mt-3 text-muted-foreground">
              最近一次登入：{info?.lastSignIn ?? "載入中…"}
            </p>
          </div>
        </section>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {notice ? <p className="text-sm text-emerald-600">{notice}</p> : null}
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
