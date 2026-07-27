import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, XCircle } from "lucide-react";

import { AuthShell } from "@/components/auth-shell";
import { OIDC } from "@/lib/identity";

export const Route = createFileRoute("/developer/oauth-test")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "授權流程檢查 · EDGAR'S Tools Identity" },
      {
        name: "description",
        content:
          "OAuth 用戶端回呼落點：顯示授權碼與狀態，用於驗證 Authorization Code + PKCE 流程。",
      },
      { property: "og:title", content: "授權流程檢查 · EDGAR'S Tools Identity" },
      { property: "og:description", content: "驗證 Authorization Code + PKCE 流程的回呼落點。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    code: typeof s.code === "string" ? s.code : undefined,
    state: typeof s.state === "string" ? s.state : undefined,
    error: typeof s.error === "string" ? s.error : undefined,
    error_description: typeof s.error_description === "string" ? s.error_description : undefined,
  }),
  component: OAuthTestPage,
});

function OAuthTestPage() {
  const { code, state, error, error_description } = Route.useSearch();
  const failed = Boolean(error);
  const pending = !code && !error;

  return (
    <AuthShell
      tone={failed ? "danger" : code ? "success" : "default"}
      title={failed ? "授權未通過" : code ? "已取得授權碼" : "授權流程檢查工具"}
      description={
        failed
          ? (error_description ?? "使用者已拒絕授權，或用戶端設定有誤。")
          : code
            ? "請於後端用此授權碼與 code_verifier 交換權杖。"
            : "把這個網址設為你的 Redirect URI（回呼位址），完成授權後就會在這裡看到結果。"
      }
      icon={
        failed ? (
          <XCircle className="h-8 w-8" aria-hidden="true" />
        ) : code ? (
          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
        ) : undefined
      }
      footer={
        <Link to="/developer" className="underline underline-offset-4 hover:text-foreground">
          回到開發者主控台
        </Link>
      }
    >
      <div className="space-y-4 text-sm">
        {code ? (
          <dl className="space-y-3 rounded-lg border border-border bg-muted/40 p-4">
            <div>
              <dt className="text-muted-foreground">Authorization Code（授權碼）</dt>
              <dd className="mt-1 break-all font-mono text-xs text-foreground">{code}</dd>
            </div>
            {state ? (
              <div>
                <dt className="text-muted-foreground">State</dt>
                <dd className="mt-1 break-all font-mono text-xs text-foreground">{state}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        {pending ? (
          <div className="rounded-lg border border-dashed border-border p-4 text-muted-foreground">
            <p className="text-foreground">目前沒有授權結果</p>
            <p className="mt-2 leading-relaxed">
              先向授權端點發出帶有 <code className="font-mono text-xs">code_challenge</code>{" "}
              的請求，完成同意後就會被導回這一頁。
            </p>
          </div>
        ) : null}

        <div>
          <p className="font-medium text-foreground">交換權杖</p>
          <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-xs leading-relaxed">
            <code>{`curl -X POST ${OIDC.token} \\
  -d grant_type=authorization_code \\
  -d code=${code ?? "<AUTHORIZATION_CODE>"} \\
  -d redirect_uri=<REDIRECT_URI> \\
  -d client_id=<CLIENT_ID> \\
  -d code_verifier=<CODE_VERIFIER>`}</code>
          </pre>
        </div>
      </div>
    </AuthShell>
  );
}
