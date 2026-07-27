import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, LockKeyhole } from "lucide-react";

import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "設定新密碼 · EDGAR'S Tools Identity" },
      { name: "description", content: "為你的 EDGAR'S Tools 帳戶設定新的登入密碼。" },
      { property: "og:title", content: "設定新密碼 · EDGAR'S Tools Identity" },
      { property: "og:description", content: "為你的 EDGAR'S Tools 帳戶設定新的登入密碼。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase 會在 recovery 連結回來時建立臨時工作階段（Session）
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    void supabase.auth.getSession().then(({ data: s }) => {
      if (s.session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setError(error.message);
    setDone(true);
  }

  return (
    <AuthShell
      title="設定新密碼"
      description={ready ? "請輸入新的登入密碼。" : "請透過信箱中的重設連結進入此頁面。"}
      icon={<LockKeyhole className="h-8 w-8" aria-hidden="true" />}
      footer={
        <Link
          to="/login"
          search={{ next: undefined }}
          className="underline underline-offset-4 hover:text-foreground"
        >
          回到登入
        </Link>
      }
    >
      {done ? (
        <p className="text-sm text-emerald-600">密碼已更新，請使用新密碼登入。</p>
      ) : (
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="password">新密碼（至少 8 碼）</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              disabled={!ready}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={busy || !ready}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            更新密碼
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
