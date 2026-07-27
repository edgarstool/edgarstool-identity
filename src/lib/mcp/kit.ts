/**
 * 獨立 MCP 工具套件（Portable MCP kit）
 * 取代 @lovable.dev/mcp-js：提供 defineTool / defineMcp / ToolContext 與
 * OAuth 2.1 Bearer Token 驗證，可在任何標準執行環境（Cloudflare Workers、Node）運作。
 */
import { z } from "zod";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

export type ToolContent = { type: "text"; text: string };

export type ToolResult = {
  content: ToolContent[];
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
};

export type ToolContext = {
  isAuthenticated: () => boolean;
  getToken: () => string | undefined;
  getUserId: () => string | undefined;
  getUserEmail: () => string | undefined;
  getClientId: () => string | undefined;
  getClaims: () => JWTPayload | undefined;
};

export type ToolAnnotations = {
  readOnlyHint?: boolean;
  idempotentHint?: boolean;
  destructiveHint?: boolean;
  openWorldHint?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ZodShape = Record<string, z.ZodType<any>>;

export type ToolDefinition<S extends ZodShape = ZodShape> = {
  name: string;
  title?: string;
  description: string;
  inputSchema: S;
  annotations?: ToolAnnotations;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (input: any, ctx: ToolContext) => Promise<ToolResult> | ToolResult;
};

export function defineTool<S extends ZodShape>(def: ToolDefinition<S>): ToolDefinition<S> {
  return def;
}

export type OAuthConfig = { issuer: string; acceptedAudiences?: string | string[] };

export type McpDefinition = {
  name: string;
  title?: string;
  version: string;
  instructions?: string;
  auth?: OAuthConfig;
  tools: ToolDefinition[];
};

export function defineMcp(def: McpDefinition): McpDefinition {
  return def;
}

export const auth = {
  oauth: {
    issuer: (config: OAuthConfig): OAuthConfig => config,
  },
};

/* ── JSON Schema 轉換 ─────────────────────────────────── */

function toJsonSchema(shape: ZodShape) {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];
  for (const [key, schema] of Object.entries(shape)) {
    properties[key] = z.toJSONSchema(schema, { io: "input", target: "draft-7" });
    if (!schema.safeParse(undefined).success) required.push(key);
  }
  return { type: "object" as const, properties, ...(required.length ? { required } : {}) };
}

/* ── Token 驗證 ───────────────────────────────────────── */

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function jwks(issuer: string) {
  let set = jwksCache.get(issuer);
  if (!set) {
    set = createRemoteJWKSet(new URL(`${issuer.replace(/\/$/, "")}/.well-known/jwks.json`));
    jwksCache.set(issuer, set);
  }
  return set;
}

async function verifyToken(token: string, config: OAuthConfig): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, jwks(config.issuer), {
      issuer: config.issuer,
      audience: config.acceptedAudiences,
    });
    // 僅接受由 OAuth 客戶端流程取得的權杖，拒絕直接複製的 app session JWT。
    if (!payload.client_id) return null;
    return payload;
  } catch {
    return null;
  }
}

function anonymousContext(): ToolContext {
  return {
    isAuthenticated: () => false,
    getToken: () => undefined,
    getUserId: () => undefined,
    getUserEmail: () => undefined,
    getClientId: () => undefined,
    getClaims: () => undefined,
  };
}

function authenticatedContext(token: string, claims: JWTPayload): ToolContext {
  return {
    isAuthenticated: () => true,
    getToken: () => token,
    getUserId: () => claims.sub,
    getUserEmail: () => (claims.email as string | undefined) ?? undefined,
    getClientId: () => (claims.client_id as string | undefined) ?? undefined,
    getClaims: () => claims,
  };
}

/* ── 中繼資料與 HTTP 處理 ─────────────────────────────── */

export function protectedResourceMetadata(mcp: McpDefinition, origin: string) {
  return {
    resource: `${origin}/mcp`,
    authorization_servers: mcp.auth ? [mcp.auth.issuer] : [],
    bearer_methods_supported: ["header"],
    scopes_supported: ["openid", "email", "profile"],
    resource_name: mcp.title ?? mcp.name,
  };
}

function unauthorized(origin: string) {
  return new Response(JSON.stringify({ error: "unauthorized" }), {
    status: 401,
    headers: {
      "content-type": "application/json",
      "www-authenticate": `Bearer resource_metadata="${origin}/.well-known/oauth-protected-resource"`,
    },
  });
}

function requestOrigin(request: Request): string {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const host = forwardedHost ?? url.host;
  const proto = forwardedProto ?? url.protocol.replace(":", "");
  return process.env.PUBLIC_ORIGIN ?? `${proto}://${host}`;
}

type JsonRpcRequest = {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
};

export function createMcpHandler(mcp: McpDefinition) {
  return async ({ request }: { request: Request }): Promise<Response> => {
    const origin = requestOrigin(request);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-headers":
            "authorization, content-type, mcp-session-id, mcp-protocol-version",
          "access-control-allow-methods": "POST, GET, OPTIONS",
        },
      });
    }
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "method_not_allowed" }), {
        status: 405,
        headers: { "content-type": "application/json", allow: "POST, OPTIONS" },
      });
    }

    let ctx = anonymousContext();
    if (mcp.auth) {
      const header = request.headers.get("authorization") ?? "";
      const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
      if (!token) return unauthorized(origin);
      const claims = await verifyToken(token, mcp.auth);
      if (!claims) return unauthorized(origin);
      ctx = authenticatedContext(token, claims);
    }

    let body: JsonRpcRequest | JsonRpcRequest[];
    try {
      body = (await request.json()) as JsonRpcRequest;
    } catch {
      return jsonRpcError(null, -32700, "Parse error");
    }

    const messages = Array.isArray(body) ? body : [body];
    const responses = [];
    for (const message of messages) {
      const result = await handleMessage(mcp, ctx, message);
      if (result) responses.push(result);
    }
    if (responses.length === 0) return new Response(null, { status: 202 });
    return new Response(JSON.stringify(Array.isArray(body) ? responses : responses[0]), {
      status: 200,
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
    });
  };
}

function jsonRpcError(id: string | number | null | undefined, code: number, message: string) {
  return new Response(
    JSON.stringify({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }),
    {
      status: 200,
      headers: { "content-type": "application/json" },
    },
  );
}

async function handleMessage(mcp: McpDefinition, ctx: ToolContext, message: JsonRpcRequest) {
  const id = message.id ?? null;
  const reply = (result: unknown) => ({ jsonrpc: "2.0" as const, id, result });
  const failure = (code: number, msg: string) => ({
    jsonrpc: "2.0" as const,
    id,
    error: { code, message: msg },
  });

  switch (message.method) {
    case "initialize":
      return reply({
        protocolVersion: "2025-06-18",
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: mcp.name, title: mcp.title, version: mcp.version },
        instructions: mcp.instructions,
      });
    case "notifications/initialized":
      return null;
    case "ping":
      return reply({});
    case "tools/list":
      return reply({
        tools: mcp.tools.map((tool) => ({
          name: tool.name,
          title: tool.title,
          description: tool.description,
          inputSchema: toJsonSchema(tool.inputSchema),
          annotations: tool.annotations,
        })),
      });
    case "tools/call": {
      const params = (message.params ?? {}) as {
        name?: string;
        arguments?: Record<string, unknown>;
      };
      const tool = mcp.tools.find((t) => t.name === params.name);
      if (!tool) return failure(-32602, `Unknown tool: ${params.name}`);
      const parsed = z.object(tool.inputSchema).safeParse(params.arguments ?? {});
      if (!parsed.success) return failure(-32602, `Invalid arguments: ${parsed.error.message}`);
      try {
        return reply(await tool.handler(parsed.data, ctx));
      } catch (error) {
        return reply({
          content: [{ type: "text", text: error instanceof Error ? error.message : String(error) }],
          isError: true,
        });
      }
    }
    default:
      return failure(-32601, `Method not found: ${message.method}`);
  }
}
