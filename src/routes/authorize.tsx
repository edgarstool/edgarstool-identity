import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";

import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SCOPE_LABELS } from "@/lib/identity";

type AuthorizationDetails = {
  client?: { name?: string; client_id?: string; client_uri?: string; logo_uri?: string } | null;
  redirect_uri?: string;
  scope?: string;
  redirect_url?: string;
  redirect_to?: string;
};

type OAuthResult = { data: AuthorizationDetails | null; error: { message: string } | null };

// Supabase 的 auth.oauth 命名空間仍在 beta，這裡加上本地型別包裝。
const oauth = (
  supabase.auth as unknown as {
    oauth: {
      getAuthorizationDetails: (id: string) => Promise<OAuthResult>;
      approveAuthorization: (id: string) => Promise<OAuthResult>;
      denyAuthorization: (id: string) => Promise<OAuthResult>;
    };
  }
).oauth;

export const Route = createFileRoute("/authorize")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "授權同意 · EDGAR'S Tools Identity" },
      { name: "description", content: "檢視並同意外部應用程式以你的身分存取 EDGAR'S Tools 服務。" },
      { property: "og:title", content: "授權同意 · EDGAR'S Tools Identity" },
      {
        property: "og:description",
        content: "檢視並同意外部應用程式以你的身分存取 EDGAR'S Tools 服務。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("缺少 authorization_id 參數");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({
        to: "/login",
        search: { next: location.pathname + location.searchStr },
      });
    }
  },
  loader: async ({ location }) => {
    const id = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauth.getAuthorizationDetails(id);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: AuthorizePage,
  errorComponent: ({ error }) => (
    <AuthShell
      tone="danger"
      title="無法載入授權請求"
      description={String((error as Error)?.message ?? error)}
      icon={<KeyRound className="h-8 w-8" aria-hidden="true" />}
      footer={
        <Link to="/" className="underline underline-offset-4 hover:text-foreground">
          回到首頁
        </Link>
      }
    />
  ),
});

function AuthorizePage() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setAccount(data.user?.email ?? null));
  }, []);

  const clientName = details?.client?.name ?? "外部應用程式";
  const clientUri = details?.client?.client_uri;
  const scopes = (details?.scope ?? "openid email profile").split(/\s+/).filter(Boolean);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorization_id)
      : await oauth.denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("授權伺服器沒有回傳重新導向位址。");
      return;
    }
    window.location.href = target;
  }

  return (
    <AuthShell
      title={`將 ${clientName} 連結到 EDGAR'S Tools`}
      description={`這會允許 ${clientName} 在你登入期間以你的身分使用 EDGAR'S Tools 服務。`}
      icon={<KeyRound className="h-8 w-8" aria-hidden="true" />}
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
          <p className="font-medium text-foreground">目前登入的帳號</p>
          <p className="mt-1 break-all text-muted-foreground">{account ?? "讀取中…"}</p>
          <Link
            to="/logout"
            className="mt-2 inline-block text-xs underline underline-offset-4 hover:text-foreground"
          >
            改用其他帳號
          </Link>
        </div>

        <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
          <p className="font-medium text-foreground">將取得的權限</p>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            {scopes.map((s: string) => (
              <li key={s}>· {SCOPE_LABELS[s] ?? `其他權限請求：${s}`}</li>
            ))}
          </ul>
          {clientUri ? (
            <p className="mt-3 break-all text-xs text-muted-foreground">
              應用程式網站：{clientUri}
            </p>
          ) : null}
          {details?.redirect_uri ? (
            <p className="mt-3 break-all text-xs text-muted-foreground">
              回呼位址：{details.redirect_uri}
            </p>
          ) : null}
        </div>

        <p className="text-xs text-muted-foreground">
          這不會繞過本服務的權限設定與後端資料存取政策；你隨時可以在「帳戶 → 安全性」中止存取。
        </p>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-2">
          <Button disabled={busy} onClick={() => decide(true)}>
            同意並連結
          </Button>
          <Button variant="outline" disabled={busy} onClick={() => decide(false)}>
            取消連結
          </Button>
        </div>
      </div>
    </AuthShell>
  );
}
