import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "服務條款 · EDGAR'S Tools Identity" },
      { name: "description", content: "使用 EDGAR'S Tools Identity 登入與授權服務的條款與規範。" },
      { property: "og:title", content: "服務條款 · EDGAR'S Tools Identity" },
      {
        property: "og:description",
        content: "使用 EDGAR'S Tools Identity 登入與授權服務的條款與規範。",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">服務條款</h1>
      <p className="mt-2 text-sm text-muted-foreground">最後更新：2026-07-27</p>

      <section className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <div>
          <h2 className="text-base font-medium text-foreground">服務內容</h2>
          <p className="mt-2">
            本服務提供 EDGAR'S Tools 帳戶的登入、註冊與 OAuth 2.1 / OIDC
            授權功能，讓你以單一帳戶連接自有與第三方應用程式。
          </p>
        </div>
        <div>
          <h2 className="text-base font-medium text-foreground">帳戶責任</h2>
          <p className="mt-2">
            你需負責保管登入憑證，並對透過你帳戶進行的授權行為負責。發現異常請立即撤銷授權並更改密碼。
          </p>
        </div>
        <div>
          <h2 className="text-base font-medium text-foreground">授權與撤銷</h2>
          <p className="mt-2">
            當你在授權同意頁按下「允許並繼續」，即代表同意將所列權限授予該應用程式。你可以隨時在帳戶頁面撤銷授權。
          </p>
        </div>
        <div>
          <h2 className="text-base font-medium text-foreground">可接受使用</h2>
          <p className="mt-2">
            不得嘗試繞過授權流程、偽造用戶端身分、進行自動化濫用或干擾服務運作。
          </p>
        </div>
        <div>
          <h2 className="text-base font-medium text-foreground">免責聲明</h2>
          <p className="mt-2">
            本服務以「現況」提供，於法律允許範圍內不對間接損害負責。條款如有更新將於本頁公告。
          </p>
        </div>
        <div>
          <h2 className="text-base font-medium text-foreground">聯絡方式</h2>
          <p className="mt-2">edgar@edgars.tools</p>
        </div>
      </section>

      <div className="mt-10 flex gap-4 text-sm">
        <Link to="/" className="underline underline-offset-4">
          回到首頁
        </Link>
        <Link to="/privacy" className="underline underline-offset-4">
          隱私權政策
        </Link>
      </div>
    </main>
  );
}
