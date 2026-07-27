import { createFileRoute } from "@tanstack/react-router";

import mcp from "@/lib/mcp/index";
import { createMcpHandler } from "@/lib/mcp/kit";

const handler = createMcpHandler(mcp);

export const Route = createFileRoute("/mcp")({
  server: { handlers: { ANY: handler } },
});
