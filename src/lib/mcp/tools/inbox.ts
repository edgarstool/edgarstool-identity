import { defineTool } from "@/lib/mcp/kit";
import { z } from "zod";
import { supabaseForUser, notAuthenticated, ok, fail } from "../supabase";

export const listInboxItems = defineTool({
  name: "list_inbox_items",
  title: "列出收件匣項目（List inbox items）",
  description: "List the signed-in user's inbox items; archived items are excluded by default.",
  inputSchema: {
    includeArchived: z.boolean().optional(),
    limit: z.number().int().min(1).max(200).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ includeArchived, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated;
    let query = supabaseForUser(ctx)
      .from("inbox_items")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit ?? 50);
    if (!includeArchived) query = query.eq("archived", false);
    const { data, error } = await query;
    return error ? fail(error.message) : ok(data);
  },
});

export const captureInboxItem = defineTool({
  name: "capture_inbox_item",
  title: "快速記錄到收件匣（Capture inbox item）",
  description: "Capture a new idea or note into the signed-in user's inbox.",
  inputSchema: {
    title: z.string().trim().min(1).max(200),
    detail: z.string().max(2000).optional(),
    source: z.string().max(60).optional().describe("Where it came from, e.g. 'claude'."),
  },
  annotations: { readOnlyHint: false, openWorldHint: false },
  handler: async ({ title, detail, source }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated;
    const { data, error } = await supabaseForUser(ctx)
      .from("inbox_items")
      .insert({
        user_id: ctx.getUserId()!,
        title,
        detail: detail ?? "",
        source: source ?? "mcp",
      })
      .select()
      .single();
    return error ? fail(error.message) : ok(data);
  },
});

export const updateInboxItem = defineTool({
  name: "update_inbox_item",
  title: "更新收件匣項目（Update inbox item）",
  description: "Update, archive or mark as promoted one inbox item owned by the signed-in user.",
  inputSchema: {
    id: z.string().uuid(),
    title: z.string().trim().min(1).max(200).optional(),
    detail: z.string().max(2000).optional(),
    archived: z.boolean().optional(),
    promoted: z.boolean().optional(),
  },
  annotations: { readOnlyHint: false, openWorldHint: false },
  handler: async ({ id, ...patch }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated;
    const fields = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined),
    ) as Record<string, string | boolean>;
    if (Object.keys(fields).length === 0) return fail("沒有要更新的欄位（No fields to update）");
    const { data, error } = await supabaseForUser(ctx)
      .from("inbox_items")
      .update(fields as never)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) return fail(error.message);
    return data ? ok(data) : fail("找不到項目（Item not found）");
  },
});

export const deleteInboxItem = defineTool({
  name: "delete_inbox_item",
  title: "刪除收件匣項目（Delete inbox item）",
  description: "Permanently delete one inbox item owned by the signed-in user.",
  inputSchema: { id: z.string().uuid() },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated;
    const { data, error } = await supabaseForUser(ctx)
      .from("inbox_items")
      .delete()
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) return fail(error.message);
    return data ? ok({ deleted: data }) : fail("找不到項目（Item not found）");
  },
});
