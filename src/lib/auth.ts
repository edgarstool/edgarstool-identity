import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

/** 只允許同源相對路徑，避免 open redirect（開放重新導向）風險 */
export function sanitizeNext(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export async function signOutEverything() {
  await supabase.auth.signOut();
}

export function readStoredNext(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sanitizeNext(sessionStorage.getItem("auth:next"));
  } catch {
    return null;
  }
}

export function clearStoredNext() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem("auth:next");
  } catch {
    /* 忽略 */
  }
}

/**
 * 從網址（hash 或 query）取出 OAuth 回傳的權杖並建立 Session。
 * 全頁重新導向（Redirect）流程時，權杖可能放在 query string，
 * Supabase 預設只讀 hash，因此這裡兩者都處理。
 */
export async function consumeTokensFromUrl() {
  if (typeof window === "undefined") return null;
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  const access_token = hash.get("access_token") ?? query.get("access_token");
  const refresh_token = hash.get("refresh_token") ?? query.get("refresh_token");

  if (access_token && refresh_token) {
    const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
    cleanUrl();
    if (!error && data.session) return data.session;
    return null;
  }

  // PKCE / code 流程
  const code = query.get("code");
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    cleanUrl();
    if (!error && data.session) return data.session;
  }
  return null;
}

function cleanUrl() {
  try {
    window.history.replaceState({}, "", window.location.pathname);
  } catch {
    /* 忽略 */
  }
}

/** 等待 Supabase 建立工作階段（Session），避免登入後卡在轉場畫面 */
export async function waitForSession(timeoutMs = 20000) {
  const initial = await supabase.auth.getSession();
  if (initial.data.session) return initial.data.session;

  return new Promise<Session | null>((resolve) => {
    let settled = false;
    // eslint-disable-next-line prefer-const
    let interval: number | undefined;
    // eslint-disable-next-line prefer-const
    let timeout: number | undefined;
    // eslint-disable-next-line prefer-const
    let subscription: { unsubscribe: () => void } | undefined;
    const finish = (session: Session | null) => {
      if (settled) return;
      settled = true;
      if (timeout !== undefined) window.clearTimeout(timeout);
      if (interval !== undefined) window.clearInterval(interval);
      subscription?.unsubscribe();
      resolve(session);
    };

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") &&
        session
      ) {
        finish(session);
      }
    });
    subscription = data.subscription;

    interval = window.setInterval(() => {
      void supabase.auth.getSession().then(({ data: sessionData }) => {
        if (sessionData.session) finish(sessionData.session);
      });
    }, 300);

    timeout = window.setTimeout(() => finish(null), timeoutMs);
  });
}
