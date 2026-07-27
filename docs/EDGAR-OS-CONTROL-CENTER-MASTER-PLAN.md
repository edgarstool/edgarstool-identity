# EDGAR-OS Control Center — Master Plan

> Control Center is the planning source of truth. Chats propose changes; the map changes only after review.

本文件描述 Control Center 的完整願景。v0.1 只實作其中最小、且能立即使用的一層。

---

## 1. 問題陳述（Problem Statement）

EDGAR-OS 的架構分散在數十段不同的對話裡。每段對話都會「合理地」提出一個新的 gateway、新的 KB、新的 dashboard。缺少單一視圖時：

- 同樣的能力被實作三次（duplicate architectures）
- 沒有人知道哪個 repo 是 canonical（正式）
- Unknown（未知）被沉默地忽略，而不是被顯示出來

Control Center 的唯一使命：**讓地景可見，並讓變更必須經過 review。**

---

## 2. Registry Layer（登錄層）

Registry 是整個產品的核心，而非 UI。

實體（Entities）：`System`、`Project`、`Workflow`、`Tool`、`RoadmapItem`、`InboxItem`、`Decision`、`Proposal`。

原則：

- 每個實體有 **stable ID**，永不重用。
- 每個 Project 必須有 **exactly one canonical repo/path**；沒有就標記 `Unknown` 並顯示警告。
- 每個 System 必須同時記錄 **owns** 與 **does not own**，邊界不清是重複架構的來源。
- Registry 以檔案形式版本化（v0.1 為 TypeScript module；未來為資料庫 + 匯出）。

---

## 3. Discussion → Proposal → Merge Workflow（討論／提案／合併流程）

```
Chat / Idea
   → Inbox（捕捉，不承諾）
      → Proposal（附帶：要接到哪個既有節點？取代什麼？）
         → Review（人工判斷；檢查 anti-duplication rules）
            → Merge into Registry（狀態改變、地圖更新）
               → Decision log（保留否決理由）
```

規則：

- 對話**不能**直接改地圖，只能產生 Proposal。
- 被否決的提案要保留可見（例如 Inbox 的封存項目），避免再次被提出。
- 每次 Merge 都要寫下一個 Next Action，否則不算完成。

---

## 4. Integrations（整合，分階段）

| 系統         | 角色                                                           | 階段    |
| ------------ | -------------------------------------------------------------- | ------- |
| GitHub       | code 的唯一真實來源；repo ↔ Project 綁定、PR 狀態回填          | Stage 2 |
| Linear       | Formal 專案的 issue 追蹤；RoadmapItem ↔ Issue 雙向連結         | Stage 3 |
| Agent-KB     | 機器可讀記憶；Registry 匯出成 KB records                       | Stage 3 |
| Obsidian     | 人類思考的原始素材；Inbox 捕捉來源                             | Stage 2 |
| Google Drive | 文件與附件參照（唯讀連結，不作為 source of truth）             | Stage 4 |
| n8n          | 定期同步、摘要、webhook                                        | Stage 3 |
| MCP Gateway  | 讓 agent 直接讀取 Registry（唯讀 tool），寫入僅能產生 Proposal | Stage 3 |
| Cloudflare   | Tunnel / Access / Workers；部署與存取控制                      | Stage 2 |

整合鐵則：**任何整合都不得成為第二個 source of truth。** 外部系統可讀、可鏡像，寫入必須回到 Proposal 流程。

---

## 5. Health & Observability（健康與可觀測性）

v0.1 明確**不做**任何 live check，UI 上以 "Seeded / manually maintained data" 標示。

未來分層：

1. **Declared status（宣告狀態）** — 人工維護，即目前作法。
2. **Reported status（回報狀態）** — 服務自行 heartbeat 到 Registry。
3. **Probed status（探測狀態）** — 主動 HTTP / TCP 探測，含歷史。
4. **Cost & usage** — AI Gateway Observability 併入本產品的一個分頁，而非獨立服務。

顯示規則：宣告與實測不一致時，以「衝突」樣式顯示，不自動覆蓋。

---

## 6. Automation（自動化）

- 每週地景摘要（狀態變化、停滯超過 N 天的 Next Action）
- Inbox 老化提醒：超過 14 天未處理者標記
- Repo 掃描：發現未登錄於 Registry 的 repo 時提出 Proposal
- 自動化只產生 Proposal，永不直接改 Registry

---

## 7. Permissions（權限）

v0.1：無登入、單人、本機。

未來：

- Viewer — 唯讀地景
- Editor — 可編輯 Roadmap / Inbox
- Reviewer — 可 merge Proposal、改變 System / Project 狀態
- Automation（service identity）— 僅能建立 Proposal

---

## 8. Staged Evolution（分階段演進）

| 階段             | 內容                                             | 完成條件              |
| ---------------- | ------------------------------------------------ | --------------------- |
| **v0.1（現在）** | 本機唯讀地景 + 本機 Roadmap / Inbox              | 連續一週實際使用      |
| v0.2             | Registry 檔案化與匯出（JSON）、Proposal 資料型別 | 可用 diff review 變更 |
| v0.3             | 後端與帳號（先決條件：EDGAR Auth 方向已定案）    | 跨裝置同步            |
| v0.4             | GitHub / Obsidian 整合、Repo 掃描                | 無孤兒 repo           |
| v0.5             | MCP 唯讀 tool、Agent-KB 匯出                     | Agent 能引用 Registry |
| v0.6             | Health probing、成本觀測                         | 宣告與實測可對照      |

每階段前置條件：上一階段被真正使用過。

---

## 9. Anti-Duplication Rules（反重複架構規則，明確且可執行）

1. **One gateway rule** — 只能有一個 MCP Gateway。新的 router / proxy 必須同時提出被取代者的 Deprecation。
2. **One canonical repo rule** — 每個 Project 只有一個 canonical repo/path。未知就顯示為 Unknown，不得隱藏。
3. **Attach-or-propose rule** — 任何新想法必須說明要接到哪個既有節點；接不上就是 Proposal，先進 Inbox。
4. **Absorb-before-create rule** — 新專案必須先回答「能不能併入現有專案？」（例：AI Gateway Observability 應優先考慮併入 Control Center）。
5. **No silent unknowns** — Unknown 是有效狀態，必須顯示；隱藏未知等於製造重複。
6. **Deprecate explicitly** — 停用要標記 Deprecated 並記錄原因，不可直接刪除。
7. **Rejected ideas stay visible** — 被否決的提案保留在封存區，避免再次被提出。
8. **Automation last** — 在 schema 與流程穩定前，不建立自動化（例：Obsidian → Agent-KB 同步排在 schema 之後）。
