import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Archive, ArchiveRestore, Loader2, Plus, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ReviewNote } from "@/components/review-note";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useControlCenterStore } from "@/lib/store";

export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { title: "收件匣 — EDGAR-OS 控制中心" },
      {
        name: "description",
        content: "在點子成為專案之前先收下來。可晉升為路線圖項目或封存 — 資料儲存在你的帳號中。",
      },
      { property: "og:title", content: "收件匣 — EDGAR-OS 控制中心" },
      {
        property: "og:description",
        content: "點子先在這裡等待審閱，避免對話衍生出平行的架構。",
      },
    ],
  }),
  component: InboxPage,
});

function InboxPage() {
  const { inbox, hydrated, userId, addInbox, patchInbox, addRoadmap } = useControlCenterStore();
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const capture = () => {
    if (!title.trim()) return;
    void addInbox({ title: title.trim(), detail: detail.trim(), source: "手動輸入" });
    setTitle("");
    setDetail("");
    toast.success("已收進收件匣");
  };

  const promote = async (id: string) => {
    const item = inbox.find((i) => i.id === id);
    if (!item) return;
    await addRoadmap({
      title: item.title,
      detail: item.detail || "由收件匣晉升 — 尚需登記權威 Repo／路徑。",
      lane: "Inbox",
      status: "Planning",
      project: "未指派",
    });
    await patchInbox(id, { promoted: true });
    toast.success("已晉升 — 請先在路線圖審閱後再轉為正式");
  };

  const toggleArchive = (id: string) => {
    const item = inbox.find((i) => i.id === id);
    if (!item) return;
    void patchInbox(id, { archived: !item.archived });
  };

  const list = inbox.filter((i) => i.archived === showArchived);

  if (!hydrated) {
    return (
      <AppShell title="收件匣" subtitle="正在從雲端載入…">
        <div className="flex items-center gap-2 rounded-xl panel p-10 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> 載入中…
        </div>
      </AppShell>
    );
  }

  if (!userId) {
    return (
      <AppShell title="收件匣" subtitle="需要登入才能存取你的收件匣">
        <div className="rounded-xl panel p-10 text-center text-sm text-muted-foreground">
          <p>你的收件匣資料存放在雲端帳號中。</p>
          <Link
            to="/login"
            search={{ next: "/inbox" } as never}
            className="mt-4 inline-block underline underline-offset-4 hover:text-foreground"
          >
            前往登入
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="收件匣" subtitle="點子在這裡等待審閱">
      <div className="space-y-5">
        <ReviewNote />

        <div className="rounded-xl panel p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            記下點子
          </div>
          <div className="mt-3 grid gap-3">
            <Input
              placeholder="一句話：這個點子是什麼？"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && capture()}
            />
            <Textarea
              placeholder="它為什麼重要？會掛在哪一個既有系統上？"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={2}
            />
            <div className="flex items-center gap-3">
              <Button onClick={capture} className="gap-2">
                <Plus className="size-4" /> 收進收件匣
              </Button>
              <p className="text-xs text-muted-foreground">
                已儲存於雲端帳號，與 MCP 工具共用同一份資料。
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showArchived ? "ghost" : "outline"}
            size="sm"
            onClick={() => setShowArchived(false)}
          >
            待處理
          </Button>
          <Button
            variant={showArchived ? "outline" : "ghost"}
            size="sm"
            onClick={() => setShowArchived(true)}
          >
            已封存
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.length === 0 && (
            <div className="rounded-xl panel p-10 text-center md:col-span-2 xl:col-span-3">
              <p className="text-sm text-muted-foreground">
                {showArchived ? "沒有已封存的項目。" : "收件匣已清空，做得好。"}
              </p>
            </div>
          )}
          {list.map((i) => (
            <article key={i.id} className="flex flex-col rounded-xl panel p-5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-sm font-semibold">{i.title}</h2>
                {i.promoted && (
                  <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                    已晉升
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{i.detail}</p>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {i.source} · {i.createdAt}
              </p>
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => void promote(i.id)}
                  disabled={i.promoted}
                >
                  <Sparkles className="size-3.5" /> 晉升為專案
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-2"
                  onClick={() => toggleArchive(i.id)}
                >
                  {i.archived ? (
                    <>
                      <ArchiveRestore className="size-3.5" /> 還原
                    </>
                  ) : (
                    <>
                      <Archive className="size-3.5" /> 封存
                    </>
                  )}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
