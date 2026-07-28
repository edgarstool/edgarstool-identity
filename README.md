# EDGAR'S Tools Identity

**EDGAR'S Tools Identity and Authorization Service**  
**EDGAR'S Tools 統一身分與授權服務**

本 repository 的正式用途，是提供 `auth.edgars.tools` 的人類登入、帳戶管理與 OAuth 2.1 / OpenID Connect（OIDC）授權介面。

它不是 EDGAR-OS 控制中心，也不是整體系統狀態或專案管理儀表板。Repository 內目前仍保留部分早期 Control Center 實作，視為待拆分的 legacy content（舊內容）；不得再以它定義本 repo 的產品定位。

---

## 正式定位（Canonical Product Contract）

### 本服務負責

- 統一登入與註冊
- Google 等已設定的第三方登入
- 忘記密碼與重設密碼
- Session（工作階段）與帳戶狀態處理
- OAuth 2.1 授權同意頁
- OpenID Connect（OIDC）身分授權流程
- OAuth callback（授權回呼）與成功／失敗結果頁
- Privacy Policy（隱私權政策）與 Terms of Service（服務條款）
- EDGAR'S Tools 服務與 AI／MCP client 共用的身分入口

### 本服務不負責

- EDGAR-OS 系統地景儀表板
- 專案、Roadmap 或 Inbox 管理
- MCP Gateway 的執行與路由
- Cloudflare、VPS、本機服務的健康監控
- Agent-KB 或 Obsidian 的內容管理
- 其他服務的業務資料

上述能力應由各自的正式 repository 或服務承擔，不應再次塞回 Identity service。

---

## 正式網域與主要路由

正式網域：`https://auth.edgars.tools`

主要路由包括：

| 路由 | 用途 |
| --- | --- |
| `/` | Identity 入口與服務說明 |
| `/login` | 登入 |
| `/register` | 註冊 |
| `/authorize` | OAuth 2.1 / OIDC 授權同意 |
| `/callback` | OAuth callback 處理 |
| `/forgot-password` | 忘記密碼 |
| `/reset-password` | 重設密碼 |
| `/logout` | 登出 |
| `/auth/success` | 驗證或授權成功 |
| `/auth/failed` | 驗證或授權失敗 |
| `/access-denied` | 已登入但無權限 |
| `/session-expired` | Session 過期 |
| `/privacy` | 隱私權政策 |
| `/terms` | 服務條款 |

實際可用路由以目前程式碼與部署結果為準。文件不得宣稱尚未實作或尚未驗證的功能已完成。

---

## 身分與存取規則

目前預設允許的 owner 帳號：

- `edgar@edgars.tools`
- `edgar@edgar.tw`

`edgar@edgarbeyourself.com` 已 deprecated（棄用），不得重新列為預設允許帳號。若舊 production 設定仍依賴它，應先記錄依賴再遷移，不可悄悄延續。

---

## 技術與部署

- TypeScript
- React 19
- TanStack Start / TanStack Router
- Supabase Auth
- OAuth 2.1 / OpenID Connect
- Cloudflare Workers
- GitHub Actions

預設分支：`master`

部署 workflow 必須以 `master` 為正式觸發分支。任何文件或設定中的 `main` 都視為過期引用。

### 環境設定原則

前端可公開設定，例如 Supabase URL 與 publishable key，可作為 build-time variables 使用；任何 service role key、OAuth client secret、JWT signing secret 或 Cloudflare API token 都不得進入 `VITE_*` 或瀏覽器 bundle。

常用設定名稱以程式碼和 workflow 實際引用為準，通常包括：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_PUBLIC_ORIGIN=https://auth.edgars.tools`
- `VITE_OIDC_ISSUER`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

Secrets 是否存在不等於部署已正確完成。每次部署仍需驗證 build、正式網域、route、title 與實際登入／授權流程。

---

## 本機執行

Windows 操作預設使用 PowerShell：

```powershell
bun install
bun run dev
bun run lint
bun run typecheck
bun run build
```

若專案 scripts 與上述名稱不同，以 `package.json` 為準，不得假裝未執行的測試已通過。

---

## Repository 現況與內容邊界

目前 repository 仍含有 EDGAR-OS Control Center 的早期頁面、資料模型與文件。這些內容不再代表本 repository 的正式產品定位。

後續整理原則：

1. Identity／OAuth／OIDC 相關內容留在本 repository。
2. Control Center 內容應搬到獨立 repository 或明確的 archive branch。
3. 在拆分完成前，不得直接永久刪除仍可能有價值的程式碼。
4. 不得因舊文件存在，就把兩個產品重新合併成同一個 production service。
5. 所有拆分、刪除與部署結果都必須可追溯到 commit 或 PR。

---

## 完成定義（Definition of Done）

一次變更只有同時符合以下條件，才可宣稱完成：

- repository 文件與產品定位一致
- `master` 上的程式碼可成功安裝、檢查與建置
- GitHub Actions 成功
- Cloudflare 實際部署成功
- `auth.edgars.tools` 顯示目前 commit 的內容
- 主要 route 完成 smoke test
- Supabase 登入與 OAuth／OIDC 流程有實際驗證
- 沒有把敏感值打進前端 bundle 或 log
- branch、commit、push、PR 與尚未完成事項都有回報

Workflow 綠燈只是其中一項，不等於網站內容與功能已經正確。
