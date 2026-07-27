import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, KeyRound } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { APP_ENDPOINTS, OIDC, SCOPE_LABELS, SUPPORTED_SCOPES } from "@/lib/identity";

export const Route = createFileRoute("/developer/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "開發者主控台 · EDGAR'S Tools Identity" },
      {
        name: "description",
        content:
          "取得 EDGAR'S Tools Identity 的 OIDC Discovery、授權與權杖端點，並管理 OAuth 應用程式與存取金鑰。",
      },
      { property: "og:title", content: "開發者主控台 · EDGAR'S Tools Identity" },
      {
        property: "og:description",
        content: "OAuth / OIDC 端點文件與應用程式管理，供 AI 客戶端與外部服務接入。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/login", search: { next: "/developer" } });
  },
  component: DeveloperConsole,
});

function DeveloperConsole() {
  return (
    <AppShell title="開發者主控台" subtitle="OAuth / OIDC 端點文件與應用程式管理">
      <div className="space-y-6">
        <Applications />
        <OAuthDocumentation />
        <div className="grid gap-6 lg:grid-cols-3">
          <CredentialSection
            title="API Keys（API 金鑰）"
            description="供伺服器對伺服器呼叫使用的長期金鑰。"
            reason="身分提供者目前未開放建立或列出應用層 API 金鑰的介面。"
          />
          <CredentialSection
            title="Service Tokens（服務權杖）"
            description="供無人值守流程（如排程、Webhook）使用的機器身分。"
            reason="尚未開放建立機器身分；目前請改用 OAuth Client Credentials 之外的既有服務帳號。"
          />
          <CredentialSection
            title="Personal Access Tokens（個人存取權杖）"
            description="以你個人身分發出的長期權杖，方便 CLI 與腳本使用。"
            reason="身分提供者尚未提供可撤銷的個人權杖 API。"
          />
        </div>
      </div>
    </AppShell>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-base font-semibold tracking-tight text-card-foreground">{title}</h2>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Applications() {
  return (
    <Card
      title="Applications（OAuth 應用程式）"
      description="以動態註冊（Dynamic Client Registration）建立的用戶端。"
    >
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                應用程式名稱
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Redirect URI（回呼位址）
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                建立時間
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={3} className="px-4 py-10 text-center text-muted-foreground">
                <p className="text-sm font-medium text-foreground">尚無法在此列出應用程式</p>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed">
                  身分提供者目前只開放「動態註冊」單一用戶端，尚未提供列出或撤銷既有用戶端的
                  API。等該 API 開放後，這張表會直接顯示名稱、回呼位址與建立時間。
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-sm font-medium text-foreground">立即註冊一個用戶端</p>
        <CodeBlock
          code={`curl -X POST ${OIDC.registration} \\
  -H "Content-Type: application/json" \\
  -d '{
    "client_name": "Your Client Name",
    "client_uri": "https://your-app.example.com",
    "redirect_uris": ["https://your-app.example.com/callback"],
    "grant_types": ["authorization_code", "refresh_token"],
    "response_types": ["code"],
    "token_endpoint_auth_method": "none"
  }'`}
        />
        <p className="text-xs text-muted-foreground">
          回應中的 <code className="font-mono">client_id</code>{" "}
          即可直接用於下方的授權流程；公開用戶端請一律搭配 PKCE（S256）。
        </p>
      </div>
    </Card>
  );
}

function OAuthDocumentation() {
  const rows: Array<[string, string]> = [
    ["Discovery URL（探索文件）", OIDC.discovery],
    ["Authorization Server Metadata", OIDC.authorizationServerMetadata],
    ["Issuer（簽發者）", OIDC.issuer],
    ["Authorization Endpoint（授權端點）", OIDC.authorization],
    ["Token Endpoint（權杖端點）", OIDC.token],
    ["UserInfo Endpoint（使用者資訊端點）", OIDC.userinfo],
    ["JWKS Endpoint（公開金鑰）", OIDC.jwks],
    ["Dynamic Registration（動態註冊）", OIDC.registration],
    ["Consent Page（授權同意頁）", APP_ENDPOINTS.consent],
    ["MCP Endpoint", APP_ENDPOINTS.mcp],
    ["Protected Resource Metadata", APP_ENDPOINTS.protectedResourceMetadata],
  ];

  return (
    <Card title="OAuth / OIDC 文件" description="AI 客戶端與外部服務可直接使用下列端點接入。">
      <dl className="divide-y divide-border rounded-lg border border-border">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
          >
            <dt className="shrink-0 text-sm text-muted-foreground sm:w-72">{label}</dt>
            <dd className="flex min-w-0 flex-1 items-center gap-2">
              <code className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">
                {value}
              </code>
              <CopyButton value={value} label={label} />
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <p className="text-sm font-medium text-foreground">支援的授權範圍（Scopes）</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {SUPPORTED_SCOPES.map((s) => (
              <li key={s}>
                <code className="font-mono text-xs">{s}</code> — {SCOPE_LABELS[s]}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <p className="text-sm font-medium text-foreground">支援的流程</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>Authorization Code + PKCE（S256）— 建議所有客戶端使用</li>
            <li>Refresh Token（更新權杖）— 換發新的存取權杖</li>
            <li>ID Token 簽章：ES256 / RS256（請以 JWKS 驗證）</li>
            <li>
              公開用戶端：
              <code className="font-mono text-xs">token_endpoint_auth_method: none</code>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-sm font-medium text-foreground">MCP 客戶端設定</p>
        <CodeBlock
          code={`{
  "mcpServers": {
    "edgars-tools": {
      "type": "http",
      "url": "${APP_ENDPOINTS.mcp}"
    }
  }
}`}
        />
        <p className="text-xs text-muted-foreground">
          MCP 端點採用 OAuth 保護；支援探索的客戶端會自動完成註冊、登入與授權同意。
        </p>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        想先確認流程是否可用？
        <Link
          to="/developer/oauth-test"
          search={{
            code: undefined,
            state: undefined,
            error: undefined,
            error_description: undefined,
          }}
          className="ml-1 underline underline-offset-4 hover:text-foreground"
        >
          開啟授權流程檢查工具
        </Link>
        。
      </p>
    </Card>
  );
}

function CredentialSection({
  title,
  description,
  reason,
}: {
  title: string;
  description: string;
  reason: string;
}) {
  return (
    <Card title={title} description={description}>
      <div className="rounded-lg border border-dashed border-border p-5 text-center">
        <KeyRound className="mx-auto h-5 w-5 text-muted-foreground" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium text-foreground">目前無可顯示的項目</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{reason}</p>
        <Button variant="outline" size="sm" className="mt-4" disabled>
          建立（尚未開放）
        </Button>
      </div>
    </Card>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-xs leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
      <div className="absolute right-2 top-2">
        <CopyButton value={code} label="程式碼片段" />
      </div>
    </div>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 shrink-0"
      aria-label={`複製${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        } catch {
          /* 瀏覽器不支援時忽略 */
        }
      }}
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-500" aria-hidden="true" />
      ) : (
        <Copy className="h-4 w-4" aria-hidden="true" />
      )}
    </Button>
  );
}
