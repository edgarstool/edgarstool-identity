import { createFileRoute } from "@tanstack/react-router";

import mcp from "@/lib/mcp/index";
import { protectedResourceMetadata } from "@/lib/mcp/kit";

export const Route = createFileRoute("/.well-known/oauth-protected-resource")({
  server: {
    handlers: {
      ANY: ({ request }) => {
        const url = new URL(request.url);
        const origin =
          process.env.PUBLIC_ORIGIN ??
          `${request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "")}://${
            request.headers.get("x-forwarded-host") ?? url.host
          }`;
        return new Response(JSON.stringify(protectedResourceMetadata(mcp, origin)), {
          headers: {
            "content-type": "application/json",
            "cache-control": "public, max-age=300",
            "access-control-allow-origin": "*",
          },
        });
      },
    },
  },
});
