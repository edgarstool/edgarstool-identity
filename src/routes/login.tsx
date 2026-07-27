import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, LogIn } from "lucide-react";

import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeNext, waitForSession } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "登入 · Edgar Auth 通用身分授權" },
      { name: "description", content: "使用 Google 或電子郵件登入 Edgar 通用身分授權服務。" },
      { property: "og:title", content: "登入 · Edgar Auth" },
      {
        property: "og:description",
        content: "使用 Google 或電子郵件登入 Edgar 通用身分授權服務。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const target = sanitizeNext(next ?? null) ?? "/auth/success";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.replace(target);
    });
  }, [target]);

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    try {
      sessionStorage.setItem("auth:next", target);
    } catch {
      /* 忽略無法寫入的情況 */
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/callback` },
    });
    if (error) {
      const recoveredSession = await waitForSession(3000);
      if (recoveredSession) {
        window.location.replace(target);
        return;
      }
      setBusy(false);
      setError(`Google 登入失敗：${error.message ?? "未知錯誤"}`);
    }
    // 成功時瀏覽器會被導向 Google，之後由 /callback 完成工作階段建立。
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setError(error.message);
      navigate({ to: target as string });
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/callback` },
      });
      setBusy(false);
      if (error) return setError(error.message);
      setNotice("註冊信已寄出，請至信箱完成驗證。");
    }
  }

  return (
    <AuthShell
      title="登入 Edgar 通用身分"
      description="一組身分，串接所有 Edgar 服務與 AI 客戶端。"
      icon={<LogIn className="h-8 w-8" aria-hidden="true" />}
      footer={
        <span className="space-x-3">
          <Link
            to="/register"
            search={{ next }}
            className="underline underline-offset-4 hover:text-foreground"
          >
            建立帳戶
          </Link>
          <Link
            to="/forgot-password"
            className="underline underline-offset-4 hover:text-foreground"
          >
            忘記密碼
          </Link>
          <Link to="/privacy" className="underline underline-offset-4 hover:text-foreground">
            隱私權政策
          </Link>
          <Link to="/terms" className="underline underline-offset-4 hover:text-foreground">
            服務條款
          </Link>
        </span>
      }
    >
      <div className="space-y-6">
        <Button onClick={handleGoogle} disabled={busy} className="w-full" variant="outline">
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          使用 Google 帳號繼續
        </Button>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          或使用電子郵件
          <span className="h-px flex-1 bg-border" />
        </div>

        <form className="space-y-4" onSubmit={handleEmail}>
          <div className="space-y-2">
            <Label htmlFor="email">電子郵件</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密碼</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {notice ? <p className="text-sm text-emerald-600">{notice}</p> : null}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {mode === "signin" ? "登入" : "建立帳號"}
          </Button>
        </form>

        <button
          type="button"
          className="w-full text-center text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setNotice(null);
          }}
        >
          {mode === "signin" ? "還沒有帳號？建立新帳號" : "已經有帳號？前往登入"}
        </button>
      </div>
    </AuthShell>
  );
}
