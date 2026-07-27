# EDGAR-OS Control Center

**Control Center is the planning source of truth. Chats propose changes; the map changes only after review.**

EDGAR-OS Control Center 是一個「地景儀表板」（landscape dashboard）：讓 Edgar 在 30 秒內看懂目前整個 EDGAR-OS 的系統、專案與待辦狀態，並阻止各自為政的對話長出重複架構（duplicate architectures）。

---

## v0.1 範圍（Scope）

| 頁面                                   | 內容                                                                                                                            |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `/` Dashboard（儀表板）                | Current focus（當前焦點）、Active systems（運作中系統）、Project status summary（專案狀態統計）、Workflows、Tools、快速搜尋入口 |
| `/architecture` Architecture（架構圖） | 互動式系統地圖，節點可點擊開啟 detail drawer（細節抽屜）                                                                        |
| `/projects` Projects（專案登錄）       | 每個專案的 status、purpose、dependencies、canonical repo/path、next action、Formal / Experiment / Deprecated / Unknown          |
| `/roadmap` Roadmap（路線圖）           | Now / Next / Later / Inbox 四個 lane，可新增、編輯、左右移動、刪除                                                              |
| `/inbox` Inbox（收件匣）               | 想法捕捉，支援 Promote to Project（升級為專案）與 Archive（封存）                                                               |
| Command Palette（指令面板）            | `⌘K` / `Ctrl+K`，可搜尋 projects、systems、workflows、tools、roadmap items                                                      |

系統節點：Local Windows Host、Cloudflare、MCP Gateway、Hermes、OpenClaw、Agent-KB、Obsidian、Automation (n8n)、EDGAR Auth、GitHub，以及 Cloud / VPS（optional infrastructure，虛線表示）。

### 不在 v0.1 範圍內

- 沒有 authentication（登入）、Supabase、OAuth
- 沒有後端 API、資料庫、部署基礎設施
- 沒有 live health checks（即時健康檢查）

---

## 執行與建置（Run / Build）

```bash
npm install       # 或 bun install
npm run dev       # 本機開發，http://localhost:8080
npm run build     # 產生正式版建置
npm run preview   # 預覽正式版建置
npm run lint      # ESLint
```

技術堆疊：TypeScript、React 19、TanStack Start / TanStack Router（本專案的標準路由）、Tailwind CSS v4、shadcn/ui、lucide-react。架構圖使用自製的 SVG + 絕對定位節點實作（不引入 React Flow，避免 SSR 相依與額外體積）。

---

## 資料模型（Data Model）

兩種資料來源，界線刻意分明：

1. **Seed registry（種子登錄資料，唯讀）** — `src/data/edgar-os.ts`
   - `SystemNode`、`SystemEdge`、`Project`、`Workflow`、`Tool`
   - 手動維護，代表「經過 review 的事實」。修改需走 code review。
2. **Local mutable state（本機可編輯狀態）** — `src/lib/store.tsx`，存於 `localStorage`
   - `RoadmapItem`（key: `edgaros.roadmap.v1`）
   - `InboxItem`（key: `edgaros.inbox.v1`）
   - 每頁底部都有「Reset to seeded data」可還原

完整欄位定義見 [`docs/DATA-SCHEMA.md`](docs/DATA-SCHEMA.md)。

Status chips：`Active`、`Planning`、`Paused`、`Experimental`、`Deprecated`、`Unknown`。
Maturity chips：`Formal`、`Experiment`、`Deprecated`、`Unknown`。

---

## 限制（Limitations）

- 所有狀態均為 **seeded / manually maintained**，UI 上已明確標示；不代表任何服務的真實運行狀態。
- Roadmap 與 Inbox 僅存在單一瀏覽器，清除瀏覽資料即遺失，且不跨裝置同步。
- 無權限控制：任何能開啟此頁面的人都能編輯本機資料。
- Repo 路徑中的 `<edgar-org>` 為 placeholder，需替換為實際 GitHub organization。

---

## 相關文件

- [`docs/EDGAR-OS-CONTROL-CENTER-MASTER-PLAN.md`](docs/EDGAR-OS-CONTROL-CENTER-MASTER-PLAN.md) — 完整願景與分階段演進
- [`docs/V0.1-ACCEPTANCE.md`](docs/V0.1-ACCEPTANCE.md) — v0.1 驗收清單
- [`docs/DATA-SCHEMA.md`](docs/DATA-SCHEMA.md) — 資料實體與未來遷移路徑
