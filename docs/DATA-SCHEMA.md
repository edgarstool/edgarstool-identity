# Data Schema — v0.1 與遷移路徑

## 1. 資料分區（Partitions）

| 分區          | 位置                                   | 可變性                 | 用途                 |
| ------------- | -------------------------------------- | ---------------------- | -------------------- |
| Seed registry | `src/data/edgar-os.ts`                 | 唯讀（需 code review） | 已 review 的地景事實 |
| Local state   | `localStorage` via `src/lib/store.tsx` | 使用者可編輯           | 尚未固化的規劃       |

localStorage keys：

- `edgaros.roadmap.v1`
- `edgaros.inbox.v1`

版本後綴 `.v1` 是刻意保留的：schema 變更時改為 `.v2`，避免讀到不相容資料。

---

## 2. 實體定義（Entities）

### `Status`

`"Active" | "Planning" | "Paused" | "Experimental" | "Deprecated" | "Unknown"`

### `Maturity`

`"Formal" | "Experiment" | "Deprecated" | "Unknown"`

### `SystemNode`

| 欄位         | 型別          | 說明                                                                                   |
| ------------ | ------------- | -------------------------------------------------------------------------------------- |
| `id`         | `string`      | 穩定識別碼，永不重用                                                                   |
| `name`       | `string`      | 顯示名稱                                                                               |
| `layer`      | `SystemLayer` | Local / Edge / Gateway / Agent / Knowledge / Automation / Identity / Source / Optional |
| `status`     | `Status`      | 宣告狀態（非實測）                                                                     |
| `optional`   | `boolean?`    | 是否為 optional infrastructure（虛線）                                                 |
| `summary`    | `string`      | 一句話說明                                                                             |
| `role`       | `string`      | 在系統中的職責                                                                         |
| `owns`       | `string[]`    | 擁有的職責邊界                                                                         |
| `doesNotOwn` | `string[]`    | 明確不擁有的職責（防重複的關鍵欄位）                                                   |
| `location`   | `string`      | 實際執行位置                                                                           |
| `risks`      | `string[]`    | 已知風險                                                                               |
| `x`, `y`     | `number`      | 地圖座標（0–100 百分比空間）                                                           |

### `SystemEdge`

`{ from: string; to: string; label: string; kind: "control" | "data" | "optional" }`

### `Project`

| 欄位           | 型別       | 說明                               |
| -------------- | ---------- | ---------------------------------- |
| `id`           | `string`   | 穩定識別碼                         |
| `name`         | `string`   | 專案名稱                           |
| `status`       | `Status`   | 目前狀態                           |
| `maturity`     | `Maturity` | 正式度                             |
| `purpose`      | `string`   | 存在理由（一句話）                 |
| `dependencies` | `string[]` | 相依系統／專案                     |
| `repo`         | `string`   | canonical repo/path                |
| `repoKnown`    | `boolean`  | 是否已確認（false 時 UI 顯示警示） |
| `nextAction`   | `string`   | 下一步（必填，空白視為停滯）       |
| `notes`        | `string`   | 補充判斷                           |

### `Workflow`

`{ id, name, status, trigger, summary, systems: string[] }`

### `Tool`

`{ id, name, category, status, usedFor }`

### `RoadmapItem`（本機可編輯）

`{ id, title, detail, lane: "Now" | "Next" | "Later" | "Inbox", status: Status, project?: string }`

### `InboxItem`（本機可編輯）

`{ id, title, detail, source, archived: boolean, promoted: boolean, createdAt: string }`

---

## 3. 不變條件（Invariants）

1. 每個 `Project.repoKnown === false` 必須在 UI 上被看見。
2. `SystemEdge.from` / `to` 必須對應存在的 `SystemNode.id`。
3. `RoadmapItem.id` 與 `InboxItem.id` 由 `uid()` 產生，跨 reset 不重用。
4. 任何刪除都以狀態變更（Deprecated / archived）優先於實際刪除。

---

## 4. 遷移路徑（Migration Path）

**Stage 1（現在）**：TypeScript module + localStorage。

**Stage 2 — Registry 檔案化**
將 `src/data/edgar-os.ts` 拆為 `registry/*.json`，於 build 時型別驗證（Zod）。變更以 PR diff review。

**Stage 3 — 後端持久化（前置條件：EDGAR Auth 定案）**
資料表對應：

| Table           | 來源實體      | 重點欄位                                                                        |
| --------------- | ------------- | ------------------------------------------------------------------------------- |
| `systems`       | `SystemNode`  | `id (text pk)`, `layer`, `status`, `owns jsonb`, `does_not_own jsonb`, `x`, `y` |
| `system_edges`  | `SystemEdge`  | `from_id`, `to_id`, `label`, `kind`                                             |
| `projects`      | `Project`     | `id`, `status`, `maturity`, `repo`, `repo_known`, `next_action`                 |
| `workflows`     | `Workflow`    | `id`, `trigger`, `systems jsonb`                                                |
| `tools`         | `Tool`        | `id`, `category`, `used_for`                                                    |
| `roadmap_items` | `RoadmapItem` | `id uuid`, `lane`, `status`, `project_id`, `owner_id`                           |
| `inbox_items`   | `InboxItem`   | `id uuid`, `archived`, `promoted`, `created_at`, `owner_id`                     |
| `proposals`     | 新增          | `id`, `target_entity`, `payload jsonb`, `state`, `decided_at`, `reason`         |

遷移動作：首次登入時讀取 localStorage，逐筆 upsert 至後端，成功後將 key 改名為 `edgaros.*.migrated`（保留備份，不刪除）。

**Stage 4 — 匯出**
提供 `GET /api/public/registry.json` 唯讀匯出，供 Agent-KB 與 MCP 唯讀 tool 使用。寫入一律走 `proposals`。
