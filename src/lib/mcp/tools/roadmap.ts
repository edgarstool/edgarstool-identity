import { defineTool } from "@/lib/mcp/kit";
import { z } from "zod";
import { supabaseForUser, notAuthenticated, ok, fail } from "../supabase";

const lane = z.enum(["Now", "Next", "Later", "Inbox"]);

export const listRoadmapItems = defineTool({
  name: "list_roadmap_items",
  title: "列出路線圖項目（List roadmap items）",
  description: "List the signed-in user's roadmap items, optionally filtered by lane.",
  inputSchema: {
    lane: lane.optional().describe("Filter by lane."),
    limit: z.number().int().min(1).max(200).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ lane: laneFilter, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated;
    let query = supabaseForUser(ctx)
      .from("roadmap_items")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit ?? 50);
    if (laneFilter) query = query.eq("lane", laneFilter);
    const { data, error } = await query;
    return error ? fail(error.message) : ok(data);
  },
});

export const createRoadmapItem = defineTool({
  name: "create_roadmap_item",
  title: "新增路線圖項目（Create roadmap item）",
  description: "Create a roadmap item for the signed-in user.",
  inputSchema: {
    title: z.string().trim().min(1).max(200),
    detail: z.string().max(2000).optional(),
    lane: lane.optional(),
    status: z.string().max(40).optional(),
    project: z.string().max(120).optional(),
  },
  annotations: { readOnlyHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated;
    const { data, error } = await supabaseForUser(ctx)
      .from("roadmap_items")
      .insert({
        user_id: ctx.getUserId()!,
        title: input.title,
        detail: input.detail ?? "",
        lane: input.lane ?? "Inbox",
        status: input.status ?? "Planning",
        project: input.project ?? null,
      })
      .select()
      .single();
    return error ? fail(error.message) : ok(data);
  },
});

export const updateRoadmapItem = defineTool({
  name: "update_roadmap_item",
  title: "更新路線圖項目（Update roadmap item）",
  description: "Update fields of one roadmap item owned by the signed-in user.",
  inputSchema: {
    id: z.string().uuid(),
    title: z.string().trim().min(1).max(200).optional(),
    detail: z.string().max(2000).optional(),
    lane: lane.optional(),
    status: z.string().max(40).optional(),
    project: z.string().max(120).nullable().optional(),
  },
  annotations: { readOnlyHint: false, openWorldHint: false },
  handler: async ({ id, ...patch }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated;
    const fields = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined),
    ) as Record<string, string | null>;
    if (Object.keys(fields).length === 0) return fail("沒有要更新的欄位（No fields to update）");
    const { data, error } = await supabaseForUser(ctx)
      .from("roadmap_items")
      .update(fields as never)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) return fail(error.message);
    return data ? ok(data) : fail("找不到項目（Item not found）");
  },
});

export const deleteRoadmapItem = defineTool({
  name: "delete_roadmap_item",
  title: "刪除路線圖項目（Delete roadmap item）",
  description: "Permanently delete one roadmap item owned by the signed-in user.",
  inputSchema: { id: z.string().uuid() },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated;
    const { data, error } = await supabaseForUser(ctx)
      .from("roadmap_items")
      .delete()
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) return fail(error.message);
    return data ? ok({ deleted: data }) : fail("找不到項目（Item not found）");
  },
});
