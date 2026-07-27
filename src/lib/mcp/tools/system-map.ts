import { defineTool } from "@/lib/mcp/kit";
import { z } from "zod";
import { supabaseForUser, notAuthenticated, ok, fail } from "../supabase";

export const listSystemMap = defineTool({
  name: "list_system_map",
  title: "系統地圖（List system map）",
  description: "List EDGAR-OS system nodes and their connections from the registry database.",
  inputSchema: { layer: z.string().optional().describe("Filter nodes by layer.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ layer }, ctx) => {
    if (!ctx.getToken()) return notAuthenticated;
    const supabase = supabaseForUser(ctx);
    let nodeQuery = supabase.from("system_nodes").select("*");
    if (layer) nodeQuery = nodeQuery.eq("layer", layer);
    const [nodes, edges] = await Promise.all([
      nodeQuery,
      supabase.from("system_edges").select("*"),
    ]);
    if (nodes.error) return fail(nodes.error.message);
    if (edges.error) return fail(edges.error.message);
    return ok({ nodes: nodes.data, edges: edges.data });
  },
});

export const listProjects = defineTool({
  name: "list_projects",
  title: "列出專案（List projects）",
  description: "List EDGAR-OS projects with status, maturity and dependencies.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.getToken()) return notAuthenticated;
    const { data, error } = await supabaseForUser(ctx).from("registry_projects").select("*");
    if (error) return fail(error.message);
    return ok(data);
  },
});
