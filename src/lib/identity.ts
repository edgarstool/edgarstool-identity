/**
 * EDGAR'S Tools Identity — 正式端點常數（Endpoints）
 * 所有對外公開的 URL 一律由環境變數提供，預設為正式網域。
 */
export const CANONICAL_ORIGIN = import.meta.env.VITE_PUBLIC_ORIGIN ?? "https://auth.edgars.tools";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "";

/** OIDC Issuer（簽發者）：必須是直連的身分服務主機 */
export const OIDC_ISSUER =
  import.meta.env.VITE_OIDC_ISSUER ?? `https://${projectRef}.supabase.co/auth/v1`;

export const OIDC = {
  issuer: OIDC_ISSUER,
  discovery: `${OIDC_ISSUER}/.well-known/openid-configuration`,
  authorizationServerMetadata: `${OIDC_ISSUER}/.well-known/oauth-authorization-server`,
  authorization: `${OIDC_ISSUER}/oauth/authorize`,
  token: `${OIDC_ISSUER}/oauth/token`,
  userinfo: `${OIDC_ISSUER}/oauth/userinfo`,
  jwks: `${OIDC_ISSUER}/.well-known/jwks.json`,
  registration: `${OIDC_ISSUER}/oauth/clients/register`,
} as const;

/** 應用程式自身的公開路徑（Consent、MCP、資源中繼資料） */
export const APP_ENDPOINTS = {
  consent: `${CANONICAL_ORIGIN}/authorize`,
  login: `${CANONICAL_ORIGIN}/login`,
  callback: `${CANONICAL_ORIGIN}/callback`,
  mcp: `${CANONICAL_ORIGIN}/mcp`,
  protectedResourceMetadata: `${CANONICAL_ORIGIN}/.well-known/oauth-protected-resource`,
} as const;

export const SUPPORTED_SCOPES = ["openid", "email", "profile", "phone"] as const;

/** 授權範圍（Scope）的中文說明 */
export const SCOPE_LABELS: Record<string, string> = {
  openid: "確認你的身分（不含密碼）",
  email: "讀取你的電子郵件地址",
  profile: "讀取你的基本個人資料（姓名、頭像）",
  phone: "讀取你的電話號碼（若你有設定）",
};
