import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Boxes,
  Command as CommandIcon,
  Gauge,
  Inbox as InboxIcon,
  ListTodo,
  Menu,
  Network,
  Search,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/components/command-palette";
import { DATA_UPDATED } from "@/data/edgar-os";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "儀表板", icon: Gauge },
  { to: "/architecture", label: "架構地圖", icon: Network },
  { to: "/projects", label: "專案清單", icon: Boxes },
  { to: "/roadmap", label: "路線圖", icon: ListTodo },
  { to: "/inbox", label: "收件匣", icon: InboxIcon },
  { to: "/services", label: "服務入口", icon: ShieldCheck },
  { to: "/developer", label: "開發者主控台", icon: Terminal },
];

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="mx-auto flex w-full max-w-[1600px]">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 shrink-0 border-r border-sidebar-border bg-sidebar transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
            navOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-full flex-col p-4">
            <Link to="/" className="mb-6 flex items-center gap-3 px-2 py-1">
              <span className="grid size-9 place-items-center rounded-lg bg-primary/15 text-primary glow-ring">
                <CommandIcon className="size-4" />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold tracking-tight">EDGAR-OS</span>
                <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  控制中心
                </span>
              </span>
            </Link>

            <nav className="flex flex-col gap-1">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:text-primary"
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <button
              onClick={() => setPaletteOpen(true)}
              className="mt-6 flex items-center gap-2 rounded-md border border-border bg-surface-2/60 px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Search className="size-4" />
              搜尋…
              <kbd className="ml-auto rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">
                ⌘K
              </kbd>
            </button>

            <div className="mt-auto rounded-lg border border-border bg-surface/60 p-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Identity v1 · GA
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                登錄檔更新於 {DATA_UPDATED}，資料已儲存於後端資料庫。
              </p>
            </div>
          </div>
        </aside>

        {navOpen && (
          <div
            className="fixed inset-0 z-30 bg-background/70 lg:hidden"
            onClick={() => setNavOpen(false)}
          />
        )}

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
            <div className="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setNavOpen(true)}
                aria-label="開啟導覽選單"
              >
                <Menu className="size-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
                  {title}
                </h1>
                {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
              </div>
              <Button
                variant="outline"
                className="ml-auto gap-2"
                onClick={() => setPaletteOpen(true)}
              >
                <Search className="size-4" />
                <span className="hidden sm:inline">搜尋</span>
                <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] sm:inline">
                  ⌘K
                </kbd>
              </Button>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
