# Legacy Document: EDGAR-OS Control Center Master Plan

> Status: **Deprecated in this repository**  
> 本文件描述的是 EDGAR-OS Control Center，不是 `auth.edgars.tools` 的 Identity／OAuth 產品契約。

## 為什麼保留

這份文件仍具有架構與產品設計參考價值，因此目前不直接刪除。但它不得再被當成 `edgarstool/edgars-tools-identity` 的 README 延伸、部署需求或正式驗收依據。

## 正式邊界

本 repository 的 canonical product（正式產品）是：

> EDGAR'S Tools Identity and Authorization Service  
> EDGAR'S Tools 統一身分與授權服務

正式網域：`https://auth.edgars.tools`

本 repository 應負責登入、註冊、帳戶狀態、Supabase Auth、OAuth 2.1、OpenID Connect、授權同意、callback 與相關法律頁面。

Control Center 的系統地景、Project、Roadmap、Inbox、Registry、健康監控與工具總覽，應移至獨立 repository 或 archive branch，不應繼續與 production Identity service 混為同一個產品。

## 後續搬移規則

1. 先建立 Control Center 的 canonical repository 或 archive target。
2. 保留 Git 歷史或在搬移 PR 中記錄來源 commit。
3. Identity repository 確認不再引用後，才能刪除這份 legacy 文件。
4. 搬移不得修改 `auth.edgars.tools` 的正式網域與 Identity 路由。
5. 未實際搬移前，狀態只能標記為 pending，不得宣稱完成。

## 原始內容摘要

原規劃的 Control Center 目標，是提供 EDGAR-OS 的地景儀表板、Registry、Project、Roadmap、Inbox、Proposal／Review 流程、GitHub／Linear／Agent-KB／Obsidian 整合，以及後續健康監控。

這些構想仍可在未來獨立實作，但不再構成本 repository 的正式 scope（範圍）。
