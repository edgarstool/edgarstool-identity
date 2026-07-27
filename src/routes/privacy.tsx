import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "隱私權政策 · EDGAR'S Tools Identity" },
      { name: "description", content: "EDGAR'S Tools Identity 如何蒐集、使用與保護你的帳戶資料。" },
      { property: "og:title", content: "隱私權政策 · EDGAR'S Tools Identity" },
      {
        property: "og:description",
        content: "EDGAR'S Tools Identity 如何蒐集、使用與保護你的帳戶資料。",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">隱私權政策</h1>
      <p className="mt-2 text-sm text-muted-foreground">最後更新：2026-07-27</p>

      <section className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <div>
          <h2 className="text-base font-medium text-foreground">我們是誰</h2>
          <p className="mt-2">
            EDGAR'S Tools Identity（以下稱「本服務」）是 EDGAR'S Tools
            的統一身分驗證中心，提供登入、註冊與 OAuth 2.1 / OIDC 授權服務。
          </p>
        </div>
        <div>
          <h2 className="text-base font-medium text-foreground">我們蒐集哪些資料</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>電子郵件地址與顯示名稱（來自你註冊或 Google 帳戶）</li>
            <li>頭像網址（若第三方登入提供）</li>
            <li>登入與授權紀錄，用於安全稽核</li>
          </ul>
        </div>
        <div>
          <h2 className="text-base font-medium text-foreground">我們如何使用資料</h2>
          <p className="mt-2">
            僅用於識別帳戶、維持登入狀態、以及在你明確同意後，將基本身分資訊分享給你所授權的應用程式。我們不會將資料用於廣告，也不會販售給第三方。
          </p>
        </div>
        <div>
          <h2 className="text-base font-medium text-foreground">資料保存與安全</h2>
          <p className="mt-2">
            帳戶資料儲存於受管理的資料庫，並以列層安全規則（Row-Level
            Security）限制存取。所有連線皆使用 HTTPS。存取權杖（Access
            Token）不會被記錄於瀏覽器主控台或伺服器日誌。
          </p>
        </div>
        <div>
          <h2 className="text-base font-medium text-foreground">你的權利</h2>
          <p className="mt-2">
            你可以隨時撤銷已授權的應用程式、要求匯出或刪除帳戶資料。請來信{" "}
            <span className="text-foreground">edgar@edgars.tools</span>。
          </p>
        </div>
      </section>

      <div className="mt-10 flex gap-4 text-sm">
        <Link to="/" className="underline underline-offset-4">
          回到首頁
        </Link>
        <Link to="/terms" className="underline underline-offset-4">
          服務條款
        </Link>
      </div>
    </main>
  );
}
