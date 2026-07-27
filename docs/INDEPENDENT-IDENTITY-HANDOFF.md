# EDGAR'S Tools Identity — 獨立部署交接文件（Independent Deployment Handoff）

本文件說明「不依賴 Lovable 的獨立副本」的架構、部署方式與後續步驟。

## 1. 原 Lovable 版本保留狀態

- 原 Lovable 專案 **未被修改、未被刪除、未重新發布**。
- 本次工作全部在獨立工作目錄完成，再推送到新的 GitHub repository。
- 原版本繼續作為：已完成參考版、UI／UX 樣板、功能驗證版、未來比對基準。

## 2. 新 GitHub Repository

| 項目 | 值 |
| --- | --- |
| Repository | `edgarstool/edgars-tools-identity` |
| 預設分支 | `main` |
| 工作分支 | `feat/independent-cloudflare-deployment` |

## 3. 可攜式架構（Portable Architecture）

| 層 | 技術 | 說明 |
| --- | --- | --- |
| 前端 | React 19 + Vite 8 | 標準 Vite 專案，無 Lovable plugin |
| 路由／SSR | TanStack Start v1 | 檔案式路由（`src/routes`） |
| 樣式 | Tailwind CSS v4 | `src/styles.css` |
| 伺服器執行環境 | Nitro → Cloudflare Workers | `.output/server` |
| 身分／資料 | Supabase（OAuth 2.1 / OIDC / PKCE / DCR） | 不變 |
| MCP | 自建 `src/lib/mcp/kit.ts` | 取代 `@lovable.dev/mcp-js` |

已移除的 Lovable 專屬相依：

- `@lovable.dev/vite-tanstack-config` → 自寫 `vite.config.ts`
- `@lovable.dev/mcp-js`（含自動產生的 `/.mcp/*` 路由）→ 自建 MCP kit 與路由
- `@lovable.dev/cloud-auth-js`（`src/integrations/lovable`）→ 改用 `supabase.auth.signInWithOAuth`
- Lovable 錯誤回報 → `src/lib/error-reporting.ts`（僅 console）
- `.lovable/`、`AGENTS.md`、Lovable preview／publish 相關設定

## 4. Supabase 連線方式

- 前端使用 `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`（publishable key 可公開）。
- 伺服器端（Workers）使用 `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY`，於 handler 內讀取。
- MCP 工具以呼叫者的 OAuth access token 建立 per-request client，RLS 以該使用者身分套用。
- Schema、RLS、`profiles`、`user_roles`、`roadmap_items`、`inbox_items`、system map、`services` 全部沿用同一個 Supabase 專案，未變更。

## 5. Cloudflare 部署方式

```bash
bun install
cp .env.example .env      # 填入實際值
bun run build             # 產出 .output/（Nitro cloudflare_module）
bunx wrangler deploy      # 使用 .wrangler/deploy/config.json
```

- `wrangler.jsonc` 提供 name／vars／custom domain 樣板。
- Nitro build 後會產生 `.output/server/wrangler.json` 與 `.wrangler/deploy/config.json`，`main` 與 `assets` 由 Nitro 決定（wrangler 提示覆寫屬正常）。
- GitHub Actions：`.github/workflows/deploy.yml`（lint → typecheck → build → deploy → smoke）。
- 正式網域預留：`https://auth.edgars.tools`。

## 6. MCP 獨立部署方式

| 端點 | 檔案 | 說明 |
| --- | --- | --- |
| `POST /mcp` | `src/routes/mcp.ts` | JSON-RPC（initialize / ping / tools/list / tools/call） |
| `GET /.well-known/oauth-protected-resource` | `src/routes/[.well-known]/oauth-protected-resource.ts` | RFC 9728 資源中繼資料 |

- Bearer token 以 `jose` 對 `MCP_OAUTH_ISSUER`（或 `VITE_OIDC_ISSUER`）的 JWKS 驗證，`aud = authenticated`，且必須含 `client_id`（拒絕直接複製的 app session JWT）。
- 未帶／無效 token 回 `401` 並附 `WWW-Authenticate: Bearer resource_metadata=...`，讓 MCP client 自動走 OAuth 探索與 DCR。
- 工具清單不變：`whoami`、system map、projects、roadmap CRUD、inbox CRUD（共 11 個）。

## 7. 所需環境變數名稱

建置期（Vite，會內嵌到前端）：
`VITE_SUPABASE_URL`、`VITE_SUPABASE_PUBLISHABLE_KEY`、`VITE_SUPABASE_PROJECT_ID`、`VITE_PUBLIC_ORIGIN`、`VITE_OIDC_ISSUER`

執行期（Cloudflare Workers）：
`SUPABASE_URL`、`SUPABASE_PUBLISHABLE_KEY`、`PUBLIC_ORIGIN`、`MCP_OAUTH_ISSUER`、`MCP_OAUTH_AUDIENCE`

## 8. 所需 secrets 名稱（不含值）

| 位置 | 名稱 | 用途 |
| --- | --- | --- |
| GitHub Actions Secrets | `CLOUDFLARE_API_TOKEN` | 部署授權 |
| GitHub Actions Secrets | `CLOUDFLARE_ACCOUNT_ID` | 目標帳號 |
| GitHub Actions Secrets | `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` / `VITE_SUPABASE_PROJECT_ID` | build 時注入 |
| Cloudflare Workers Secret | `SUPABASE_PUBLISHABLE_KEY` | 伺服器端讀取 |
| Cloudflare Workers Secret（選用） | `SUPABASE_SERVICE_ROLE_KEY` | 僅維運用；一般部署不需要 |

**本次未讀取、未複製、未提交任何 secret 值。** repo 中沒有 `.env`，只有 `.env.example` 佔位符。

## 9. 尚存的 Lovable 依賴

- Supabase 專案本身目前由 Lovable Cloud 代管（帳單與後台入口）。程式碼層面已無綁定；若要完全脫離，需將 Supabase 專案轉為自有帳號或改連自建 Supabase。
- Supabase 的 OAuth Server（DCR／`/oauth/authorize`）設定原先由 Lovable 工具啟用；設定已存在於 Supabase 端，獨立副本直接使用，不需 Lovable runtime。
- 其餘 Hosting／Publish／Custom Domain／Preview URL／Lovable MCP／Lovable Secrets 皆已解除。

## 10. build 與測試結果（本機驗證）

| 項目 | 指令 | 結果 |
| --- | --- | --- |
| 相依安裝 | `bun install` | 成功（433 packages） |
| 型別檢查 | `bun run typecheck` | 通過（0 error） |
| Lint | `bun run lint` | 通過（0 error，12 個既有 fast-refresh warning） |
| 正式建置 | `bun run build` | 成功（Nitro cloudflare 輸出） |
| 冒煙測試 | `bun run smoke` | 5／5 通過（`/`、`/login`、`/privacy`、資源中繼資料、`/mcp` 401） |

## 11. 後續部署步驟

1. 於 Cloudflare 建立 Workers 專案並取得 API Token 與 Account ID。
2. 在 GitHub repository 設定上述 Secrets 與 Variables（`VITE_PUBLIC_ORIGIN`、`VITE_OIDC_ISSUER`）。
3. 合併 PR 到 `main`，Actions 會自動 build 並部署。
4. 於 Cloudflare 綁定 `auth.edgars.tools`。
5. 在 Supabase Auth 的 Redirect 允許清單加入 `https://auth.edgars.tools/callback` 與 `/authorize`。
6. 若使用 Cloudflare Access：務必為 `/mcp*`、`/.well-known/*`、`/callback`、`/authorize` 設定 **Bypass**，否則會擋掉 OAuth 與 MCP。
7. 部署後執行 `SMOKE_BASE_URL=https://auth.edgars.tools bun run smoke`。

## 12. 回滾方式（Rollback）

- **應用層**：`wrangler rollback`，或 revert PR 後重新部署。
- **流量層**：將 `auth.edgars.tools` 指回原本的 Lovable 發布網址。
- **完整回滾**：原 Lovable 專案未變動，隨時可直接使用。
- **資料層**：Supabase schema 未變更，不需資料回滾。
