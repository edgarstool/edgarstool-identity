import { createClient } from "@supabase/supabase-js";
import type { ToolContext } from "@/lib/mcp/kit";
import type { Database } from "@/integrations/supabase/types";

/** Per-request Supabase client that runs as the authenticated MCP caller (RLS applies). */
export function supabaseForUser(ctx: ToolContext) {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const notAuthenticated = {
  content: [{ type: "text" as const, text: "未通過驗證（Not authenticated）" }],
  isError: true,
};

export function ok(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    structuredContent: { data } as Record<string, unknown>,
  };
}

export function fail(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true };
}
