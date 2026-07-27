import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";

import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeNext } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "建立帳戶 · EDGAR'S Tools Identity" },
      { name: "description", content: "建立 EDGAR'S Tools 帳戶，一組身分安全連接所有授權應用。" },
      { property: "og:title", content: "建立帳戶 · EDGAR'S Tools Identity" },
      {
        property: "og:description",
        content: "建立 EDGAR'S Tools 帳戶，一組身分安全連接所有授權應用。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { next } = Route.useSearch();
  const target = sanitizeNext(next ?? null) ?? "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(target)}`,
      },
    });
    setBusy(false);
    if (error) return setError(error.message);
    setNotice("驗證信已寄出，請到信箱點擊連結完成註冊。");
  }

  return (
    <AuthShell
      title="建立 EDGAR'S Tools 帳戶"
      description="一個帳戶，安全連接 EDGAR'S Tools 與授權應用。"
      icon={<UserPlus className="h-8 w-8" aria-hidden="true" />}
      footer={
        <span className="space-x-3">
          <Link
            to="/login"
            search={{ next }}
            className="underline underline-offset-4 hover:text-foreground"
          >
            已有帳戶？登入
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
      <form className="space-y-4" onSubmit={submit}>
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
          <Label htmlFor="password">密碼（至少 8 碼）</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
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
          建立帳戶
        </Button>
      </form>
    </AuthShell>
  );
}
