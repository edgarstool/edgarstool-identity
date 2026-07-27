import { useNavigate } from "@tanstack/react-router";
import {
  Boxes,
  ListTodo,
  Network,
  Inbox as InboxIcon,
  Workflow as WorkflowIcon,
  Wrench,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useControlCenterStore } from "@/lib/store";
import { useRegistry } from "@/lib/registry";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const { roadmap } = useControlCenterStore();
  const { projects, systems, workflows, tools } = useRegistry();

  const go = (to: string, hash?: string) => {
    onOpenChange(false);
    navigate({ to, hash });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="搜尋專案、系統、工作流程、工具、路線圖…" />
      <CommandList>
        <CommandEmpty>登錄檔中找不到相符的項目。</CommandEmpty>

        <CommandGroup heading="專案">
          {projects.map((p) => (
            <CommandItem
              key={p.id}
              value={`project ${p.name} ${p.purpose} ${p.status}`}
              onSelect={() => go("/projects", p.id)}
            >
              <Boxes className="text-muted-foreground" />
              <span>{p.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{p.status}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="系統">
          {systems.map((s) => (
            <CommandItem
              key={s.id}
              value={`system ${s.name} ${s.summary} ${s.layer}`}
              onSelect={() => go("/architecture", s.id)}
            >
              <Network className="text-muted-foreground" />
              <span>{s.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{s.layer}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="路線圖">
          {roadmap.map((r) => (
            <CommandItem
              key={r.id}
              value={`roadmap ${r.title} ${r.detail} ${r.lane}`}
              onSelect={() => go("/roadmap")}
            >
              <ListTodo className="text-muted-foreground" />
              <span>{r.title}</span>
              <span className="ml-auto text-xs text-muted-foreground">{r.lane}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="工作流程">
          {workflows.map((w) => (
            <CommandItem
              key={w.id}
              value={`workflow ${w.name} ${w.summary}`}
              onSelect={() => go("/")}
            >
              <WorkflowIcon className="text-muted-foreground" />
              <span>{w.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{w.status}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="工具">
          {tools.map((t) => (
            <CommandItem
              key={t.id}
              value={`tool ${t.name} ${t.usedFor} ${t.category}`}
              onSelect={() => go("/")}
            >
              <Wrench className="text-muted-foreground" />
              <span>{t.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{t.category}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="收件匣">
          <CommandItem value="open inbox capture" onSelect={() => go("/inbox")}>
            <InboxIcon className="text-muted-foreground" />
            <span>開啟收件匣</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
