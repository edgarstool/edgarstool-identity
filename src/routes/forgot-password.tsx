import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";

import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "忘記密碼 · EDGAR'S Tools Identity" },
      { name: "description", content: "寄送重設密碼連結到你的 EDGAR'S Tools 帳戶信箱。" },
      { property: "og:title", content: "忘記密碼 · EDGAR'S Tools Identity" },
      { property: "og:description", content: "寄送重設密碼連結到你的 EDGAR'S Tools 帳戶信箱。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) return setError(error.message);
    setSent(true);
  }

  return (
    <AuthShell
      title="重設密碼"
      description="輸入帳戶信箱，我們會寄送一封重設密碼的安全連結。"
      icon={<KeyRound className="h-8 w-8" aria-hidden="true" />}
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
      {sent ? (
        <p className="text-sm text-emerald-600">
          若該信箱存在，重設密碼信已寄出。請於 60 分鐘內完成重設。
        </p>
      ) : (
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
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            寄送重設連結
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
