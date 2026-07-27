#!/usr/bin/env node
/**
 * Smoke test（冒煙測試）：驗證獨立部署後的關鍵端點是否可用。
 * 用法：SMOKE_BASE_URL=https://auth.edgars.tools node scripts/smoke-test.mjs
 */
const base = (process.env.SMOKE_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const checks = [
  { name: "首頁", path: "/", expect: (r) => r.status === 200 },
  { name: "登入頁", path: "/login", expect: (r) => r.status === 200 },
  { name: "隱私權政策", path: "/privacy", expect: (r) => r.status === 200 },
  {
    name: "OAuth 受保護資源中繼資料",
    path: "/.well-known/oauth-protected-resource",
    expect: (r) => r.status === 200,
    body: (j) => Array.isArray(j.authorization_servers) && j.authorization_servers.length > 0,
  },
  {
    name: "MCP 端點需驗證（401 + WWW-Authenticate）",
    path: "/mcp",
    method: "POST",
    payload: { jsonrpc: "2.0", id: 1, method: "tools/list" },
    expect: (r) => r.status === 401 && !!r.headers.get("www-authenticate"),
  },
];

let failed = 0;
for (const c of checks) {
  try {
    const res = await fetch(base + c.path, {
      method: c.method ?? "GET",
      headers: c.payload
        ? { "content-type": "application/json", accept: "application/json, text/event-stream" }
        : {},
      body: c.payload ? JSON.stringify(c.payload) : undefined,
    });
    let ok = c.expect(res);
    if (ok && c.body) {
      ok = c.body(await res.json());
    }
    console.log(`${ok ? "PASS" : "FAIL"}  ${c.name} → ${c.path} [${res.status}]`);
    if (!ok) failed++;
  } catch (err) {
    console.log(`FAIL  ${c.name} → ${c.path} (${err.message})`);
    failed++;
  }
}
console.log(failed === 0 ? "\n全部通過（all checks passed）" : `\n失敗 ${failed} 項`);
process.exit(failed === 0 ? 0 : 1);
