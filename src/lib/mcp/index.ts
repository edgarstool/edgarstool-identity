import { auth, defineMcp } from "@/lib/mcp/kit";
import whoami from "./tools/whoami";
import {
  listRoadmapItems,
  createRoadmapItem,
  updateRoadmapItem,
  deleteRoadmapItem,
} from "./tools/roadmap";
import { listInboxItems, captureInboxItem, updateInboxItem, deleteInboxItem } from "./tools/inbox";
import { listSystemMap, listProjects } from "./tools/system-map";

// OAuth issuer 必須是直連的 Supabase Auth 主機，可用環境變數覆寫。
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";
const issuer = import.meta.env.VITE_OIDC_ISSUER ?? `https://${projectRef}.supabase.co/auth/v1`;

export default defineMcp({
  name: "edgar-os-control-center",
  title: "EDGAR-OS Control Center",
  version: "0.1.0",
  instructions:
    "Tools for the EDGAR-OS Control Center. Read the system map and projects, and read/write the signed-in user's roadmap and inbox items.",
  auth: auth.oauth.issuer({
    issuer,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    whoami,
    listSystemMap,
    listProjects,
    listRoadmapItems,
    createRoadmapItem,
    updateRoadmapItem,
    deleteRoadmapItem,
    listInboxItems,
    captureInboxItem,
    updateInboxItem,
    deleteInboxItem,
  ],
});
