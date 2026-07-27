import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";

import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/logout")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "登出 · Edgar Auth" },
      { name: "description", content: "已安全登出 Edgar 通用身分授權服務。" },
      { property: "og:title", content: "登出 · Edgar Auth" },
      { property: "og:description", content: "已安全登出 Edgar 通用身分授權服務。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LogoutPage,
});

function LogoutPage() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    void supabase.auth.signOut().finally(() => setDone(true));
  }, []);

  return (
    <AuthShell
      title={done ? "你已登出" : "正在登出…"}
      description={done ? "工作階段已清除，這台裝置不再保有登入狀態。" : "正在清除工作階段。"}
      icon={<LogOut className="h-8 w-8" aria-hidden="true" />}
      footer={
        <Link
          to="/login"
          search={{ next: undefined }}
          className="underline underline-offset-4 hover:text-foreground"
        >
          重新登入
        </Link>
      }
    >
      <Button className="w-full" onClick={() => window.location.replace("/login")}>
        重新登入
      </Button>
    </AuthShell>
  );
}
