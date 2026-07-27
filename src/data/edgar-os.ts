/**
 * EDGAR-OS Control Center — seeded registry data (v0.1).
 *
 * IMPORTANT: every value in this file is *manually maintained seed data*.
 * There are no live health checks, no API polling and no backend in v0.1.
 * Treat it as the planning source of truth, edited by review — not by chat.
 */

export type Status = "Active" | "Planning" | "Paused" | "Experimental" | "Deprecated" | "Unknown";

export type Maturity = "Formal" | "Experiment" | "Deprecated" | "Unknown";

export type SystemLayer =
  | "Local"
  | "Edge"
  | "Gateway"
  | "Agent"
  | "Knowledge"
  | "Automation"
  | "Identity"
  | "Source"
  | "Optional";

export interface SystemNode {
  id: string;
  name: string;
  layer: SystemLayer;
  status: Status;
  optional?: boolean;
  summary: string;
  role: string;
  owns: string[];
  doesNotOwn: string[];
  location: string;
  risks: string[];
  /** grid coordinates on the architecture map (0..100 space) */
  x: number;
  y: number;
}

export interface SystemEdge {
  from: string;
  to: string;
  label: string;
  kind: "control" | "data" | "optional";
}

export interface Project {
  id: string;
  name: string;
  status: Status;
  maturity: Maturity;
  purpose: string;
  dependencies: string[];
  repo: string;
  repoKnown: boolean;
  nextAction: string;
  notes: string;
}

export interface Workflow {
  id: string;
  name: string;
  status: Status;
  trigger: string;
  summary: string;
  systems: string[];
}

export interface Tool {
  id: string;
  name: string;
  category: string;
  status: Status;
  usedFor: string;
}

export const REVIEW_NOTE =
  "指揮中心（Control Center）是規劃的唯一真實來源。對話只能提出變更建議，地圖需經審閱後才會更新。";

export const DATA_UPDATED = "2026-07-26";

export const currentFocus = {
  headline: "先整併 Gateway（閘道）層，再增加新的 Agent",
  detail:
    "只保留一個 MCP Gateway、一套身分驗證機制、一份權威地圖。每一次新對話都必須掛在既有節點上，否則就要明確提出新增節點的建議。",
  focusProjectIds: ["mcp-gateway", "edgar-auth", "control-center"],
  guardrails: [
    "不淘汰舊的，就不新增任何 Gateway、Router 或 Proxy。",
    "沒有登記權威 Repo／路徑的專案，一律視為不存在。",
    "實驗先留在收件匣，晉升後才進入正式環境。",
  ],
};

export const systems: SystemNode[] = [
  {
    id: "local-host",
    name: "Local Windows Host",
    layer: "Local",
    status: "Active",
    summary: "Primary workstation running local agents, CLIs and dev servers.",
    role: "Execution surface for local agents, file system and long-running dev processes.",
    owns: ["Local agent runtimes", "Dev servers", "Local file vault mount"],
    doesNotOwn: ["Public ingress", "Shared team state"],
    location: "Windows 11 + WSL",
    risks: ["Single point of failure", "Availability tied to machine uptime"],
    x: 12,
    y: 22,
  },
  {
    id: "cloudflare",
    name: "Cloudflare",
    layer: "Edge",
    status: "Active",
    summary: "Edge network: DNS, Tunnel, Access, Workers.",
    role: "Public entry point and edge compute in front of local and cloud services.",
    owns: ["DNS", "Tunnel ingress", "Edge routing", "Workers runtime"],
    doesNotOwn: ["Business logic", "Long-term storage"],
    location: "Cloudflare account (managed)",
    risks: ["Config drift between Tunnel and Access rules"],
    x: 50,
    y: 8,
  },
  {
    id: "mcp-gateway",
    name: "MCP Gateway",
    layer: "Gateway",
    status: "Active",
    summary: "Single aggregation point for MCP servers and tool exposure.",
    role: "Normalises MCP tool access for every agent client; the only sanctioned tool router.",
    owns: ["MCP server registry", "Tool namespacing", "Client fan-out"],
    doesNotOwn: ["Model selection", "Agent memory"],
    location: "Local host, exposed via Cloudflare Tunnel",
    risks: ["Duplicate gateways spun up per-conversation", "Unversioned tool names"],
    x: 50,
    y: 30,
  },
  {
    id: "hermes",
    name: "Hermes",
    layer: "Agent",
    status: "Active",
    summary: "Orchestration and messaging layer between Edgar and agents.",
    role: "Routes intent to the right agent/tool and keeps a conversational trace.",
    owns: ["Agent routing", "Conversation trace", "Task dispatch"],
    doesNotOwn: ["Tool implementations", "Knowledge storage"],
    location: "Local host service",
    risks: ["Overlaps with MCP Gateway if scope is not held"],
    x: 24,
    y: 52,
  },
  {
    id: "openclaw",
    name: "OpenClaw",
    layer: "Agent",
    status: "Experimental",
    summary: "Autonomous execution agent sandbox.",
    role: "Runs longer autonomous jobs against a constrained toolset.",
    owns: ["Autonomous run loop", "Sandboxed execution"],
    doesNotOwn: ["Production writes", "Credential storage"],
    location: "Local host sandbox",
    risks: ["Unbounded runs", "Unclear promotion path to Formal"],
    x: 48,
    y: 56,
  },
  {
    id: "agent-kb",
    name: "Agent-KB",
    layer: "Knowledge",
    status: "Planning",
    summary: "Structured knowledge base agents read from and write to.",
    role: "Canonical machine-readable memory: decisions, entities, conventions.",
    owns: ["Structured records", "Retrieval index"],
    doesNotOwn: ["Human note-taking UX", "Runtime secrets"],
    location: "To be decided (candidate: local store + sync)",
    risks: ["Divergence from Obsidian notes", "No agreed schema yet"],
    x: 74,
    y: 52,
  },
  {
    id: "obsidian",
    name: "Obsidian",
    layer: "Knowledge",
    status: "Active",
    summary: "Human-first note vault, daily notes and long-form thinking.",
    role: "Where Edgar thinks. Source of raw material for Agent-KB.",
    owns: ["Daily notes", "Long-form docs", "Inbox capture"],
    doesNotOwn: ["Agent-readable schema", "Task execution"],
    location: "Local vault on Windows host",
    risks: ["Becomes an unstructured dumping ground"],
    x: 88,
    y: 30,
  },
  {
    id: "automation",
    name: "Automation (n8n)",
    layer: "Automation",
    status: "Planning",
    summary: "Scheduled and event-driven workflow automation.",
    role: "Glue for recurring jobs: syncs, digests, webhooks.",
    owns: ["Cron jobs", "Webhook handlers", "Cross-tool syncs"],
    doesNotOwn: ["Agent reasoning", "Source of truth data"],
    location: "Self-hosted n8n (planned)",
    risks: ["Hidden business logic buried in flows"],
    x: 74,
    y: 76,
  },
  {
    id: "auth",
    name: "EDGAR Auth",
    layer: "Identity",
    status: "Planning",
    summary: "Single identity and access model across EDGAR-OS surfaces.",
    role: "One login story for dashboards, gateways and internal tools.",
    owns: ["Identity", "Session", "Access policy"],
    doesNotOwn: ["App-level permissions logic", "Secrets vault"],
    location: "Design phase — no implementation in v0.1",
    risks: ["Per-app ad-hoc auth accumulating"],
    x: 26,
    y: 8,
  },
  {
    id: "github",
    name: "GitHub",
    layer: "Source",
    status: "Active",
    summary: "Canonical code storage and change history.",
    role: "Every Formal project must have exactly one canonical repository here.",
    owns: ["Source of truth for code", "PR review trail"],
    doesNotOwn: ["Runtime state", "Planning source of truth"],
    location: "github.com/<edgar-org>",
    risks: ["Orphan repos created from one-off chats"],
    x: 12,
    y: 78,
  },
  {
    id: "cloud-vps",
    name: "Cloud / VPS",
    layer: "Optional",
    status: "Unknown",
    optional: true,
    summary: "Optional always-on compute for services that outgrow the local host.",
    role: "Fallback/uplift target when uptime matters more than locality.",
    owns: ["Always-on runtime (if adopted)"],
    doesNotOwn: ["Anything today — not adopted in v0.1"],
    location: "Not provisioned",
    risks: ["Premature adoption duplicates local services"],
    x: 50,
    y: 88,
  },
];

export const systemEdges: SystemEdge[] = [
  { from: "auth", to: "cloudflare", label: "policy", kind: "control" },
  { from: "cloudflare", to: "mcp-gateway", label: "tunnel", kind: "data" },
  { from: "local-host", to: "mcp-gateway", label: "hosts", kind: "control" },
  { from: "mcp-gateway", to: "hermes", label: "tools", kind: "data" },
  { from: "mcp-gateway", to: "openclaw", label: "tools", kind: "data" },
  { from: "mcp-gateway", to: "agent-kb", label: "read/write", kind: "data" },
  { from: "obsidian", to: "agent-kb", label: "source material", kind: "data" },
  { from: "agent-kb", to: "automation", label: "sync jobs", kind: "data" },
  { from: "hermes", to: "github", label: "changes", kind: "data" },
  { from: "local-host", to: "obsidian", label: "vault", kind: "data" },
  { from: "automation", to: "cloud-vps", label: "if adopted", kind: "optional" },
  { from: "cloudflare", to: "cloud-vps", label: "if adopted", kind: "optional" },
];

export const projects: Project[] = [
  {
    id: "hermes",
    name: "Hermes",
    status: "Active",
    maturity: "Formal",
    purpose: "Agent orchestration and messaging layer for EDGAR-OS.",
    dependencies: ["MCP Gateway", "Local Windows Host"],
    repo: "github.com/<edgar-org>/hermes",
    repoKnown: true,
    nextAction: "Freeze the routing contract so MCP Gateway scope stops leaking in.",
    notes: "Most mature runtime piece. Keep it thin: routing, not tools.",
  },
  {
    id: "edgar-auth",
    name: "EDGAR Auth",
    status: "Planning",
    maturity: "Formal",
    purpose: "One identity and access model for every EDGAR-OS surface.",
    dependencies: ["Cloudflare Access", "MCP Gateway"],
    repo: "Not yet created",
    repoKnown: false,
    nextAction: "Write a one-page decision: Cloudflare Access vs self-hosted IdP.",
    notes: "Explicitly out of scope for Control Center v0.1.",
  },
  {
    id: "mcp-gateway",
    name: "MCP Gateway",
    status: "Active",
    maturity: "Formal",
    purpose: "Single aggregation point for all MCP servers and tools.",
    dependencies: ["Local Windows Host", "Cloudflare Tunnel"],
    repo: "github.com/<edgar-org>/mcp-gateway",
    repoKnown: true,
    nextAction: "Publish the tool namespace registry and deprecate ad-hoc endpoints.",
    notes: "Highest duplication risk in the whole landscape.",
  },
  {
    id: "agent-kb",
    name: "Agent-KB",
    status: "Planning",
    maturity: "Formal",
    purpose: "Structured, agent-readable knowledge base and decision log.",
    dependencies: ["Obsidian", "MCP Gateway"],
    repo: "Unknown",
    repoKnown: false,
    nextAction: "Draft the entity schema (Decision, Entity, Convention, Source).",
    notes: "Blocked on schema agreement, not on tooling.",
  },
  {
    id: "big",
    name: "BIG",
    status: "Unknown",
    maturity: "Unknown",
    purpose: "Scope not yet recorded in the registry — needs a definition pass.",
    dependencies: ["Unknown"],
    repo: "Unknown",
    repoKnown: false,
    nextAction: "Define it in one sentence or move it to the Inbox.",
    notes: "Placeholder kept visible on purpose: unknowns must be seen, not hidden.",
  },
  {
    id: "control-center",
    name: "Control Center",
    status: "Active",
    maturity: "Formal",
    purpose: "See the whole EDGAR-OS landscape in 30 seconds; prevent duplicate architectures.",
    dependencies: ["None (local-only in v0.1)"],
    repo: "This repository",
    repoKnown: true,
    nextAction: "Use it daily for one week before adding any backend.",
    notes: "v0.1 is local-first: no auth, no database, no live checks.",
  },
  {
    id: "ai-gateway-observability",
    name: "AI Gateway Observability",
    status: "Experimental",
    maturity: "Experiment",
    purpose: "Usage, cost and latency visibility across model calls.",
    dependencies: ["Cloudflare", "MCP Gateway"],
    repo: "Unknown",
    repoKnown: false,
    nextAction: "Decide whether this is a page in Control Center or a separate service.",
    notes: "Candidate for absorption instead of a standalone project.",
  },
  {
    id: "cloudflare-feature-sprint",
    name: "Cloudflare Feature Sprint",
    status: "Paused",
    maturity: "Experiment",
    purpose: "Timeboxed exploration of Workers, Tunnel and Access capabilities.",
    dependencies: ["Cloudflare"],
    repo: "Unknown",
    repoKnown: false,
    nextAction: "Resume only after EDGAR Auth direction is decided.",
    notes: "Paused deliberately to avoid parallel edge architectures.",
  },
];

export const workflows: Workflow[] = [
  {
    id: "wf-daily-review",
    name: "Daily landscape review",
    status: "Active",
    trigger: "Manual, each morning",
    summary: "Open Control Center, scan status chips, move at most three roadmap items.",
    systems: ["Control Center"],
  },
  {
    id: "wf-proposal",
    name: "Chat proposal → review → merge",
    status: "Planning",
    trigger: "When a conversation proposes a new system or project",
    summary: "Capture in Inbox, review against the map, then promote or reject.",
    systems: ["Control Center", "Agent-KB"],
  },
  {
    id: "wf-vault-sync",
    name: "Obsidian → Agent-KB sync",
    status: "Planning",
    trigger: "Scheduled (planned)",
    summary: "Extract structured records from notes into the knowledge base.",
    systems: ["Obsidian", "Agent-KB", "Automation (n8n)"],
  },
  {
    id: "wf-tunnel-health",
    name: "Tunnel & gateway sanity check",
    status: "Unknown",
    trigger: "Manual",
    summary: "Manually verify tunnel + gateway reachability. Not automated in v0.1.",
    systems: ["Cloudflare", "MCP Gateway"],
  },
];

export const tools: Tool[] = [
  {
    id: "t-claude-code",
    name: "Claude Code",
    category: "Coding agent",
    status: "Active",
    usedFor: "Repo-level implementation work",
  },
  {
    id: "t-codex",
    name: "Codex",
    category: "Coding agent",
    status: "Active",
    usedFor: "Execution handoffs from planning",
  },
  {
    id: "t-n8n",
    name: "n8n",
    category: "Automation",
    status: "Planning",
    usedFor: "Scheduled syncs and webhooks",
  },
  {
    id: "t-linear",
    name: "Linear",
    category: "Tracking",
    status: "Experimental",
    usedFor: "Issue tracking for Formal projects",
  },
  {
    id: "t-notion",
    name: "Notion",
    category: "Docs",
    status: "Paused",
    usedFor: "Shared documents; overlaps with Obsidian",
  },
  {
    id: "t-cf-tunnel",
    name: "Cloudflare Tunnel",
    category: "Networking",
    status: "Active",
    usedFor: "Exposing local services safely",
  },
];

export const statusOrder: Status[] = [
  "Active",
  "Planning",
  "Experimental",
  "Paused",
  "Deprecated",
  "Unknown",
];
