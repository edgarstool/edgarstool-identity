import { defineTool } from "@/lib/mcp/kit";
import { supabaseForUser, notAuthenticated, ok, fail } from "../supabase";

export default defineTool({
  name: "whoami",
  title: "目前使用者（Who am I）",
  description: "Return the signed-in user's id, email and profile.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated;
    const { data, error } = await supabaseForUser(ctx)
      .from("profiles")
      .select("*")
      .eq("id", ctx.getUserId()!)
      .maybeSingle();
    if (error) return fail(error.message);
    return ok({ userId: ctx.getUserId(), email: ctx.getUserEmail(), profile: data });
  },
});
