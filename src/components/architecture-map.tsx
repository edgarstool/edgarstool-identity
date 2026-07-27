import { useState } from "react";
import { type SystemEdge, type SystemNode } from "@/data/edgar-os";
import { useRegistry } from "@/lib/registry";
import { StatusChip } from "@/components/status-chip";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function ArchitectureMap({ initialSelected }: { initialSelected?: string }) {
  const { systems, systemEdges } = useRegistry();
  const byId = (id: string) => systems.find((s) => s.id === id)!;
  const [selectedId, setSelectedId] = useState<string | null>(initialSelected ?? null);
  const [hovered, setHovered] = useState<string | null>(null);
  const selected = selectedId ? systems.find((s) => s.id === selectedId) : undefined;

  const isDimmed = (id: string) => {
    if (!hovered) return false;
    if (hovered === id) return false;
    return !systemEdges.some(
      (e) => (e.from === hovered && e.to === id) || (e.to === hovered && e.from === id),
    );
  };

  return (
    <>
      <div className="relative w-full overflow-hidden rounded-xl panel grid-backdrop">
        <div className="relative h-[620px] w-full min-w-[720px] sm:h-[680px]">
          <svg className="absolute inset-0 size-full" aria-hidden="true">
            {systemEdges.map((e, i) => {
              const a = byId(e.from);
              const b = byId(e.to);
              const active = hovered === e.from || hovered === e.to;
              return (
                <g key={i}>
                  <line
                    x1={`${a.x}%`}
                    y1={`${a.y}%`}
                    x2={`${b.x}%`}
                    y2={`${b.y}%`}
                    stroke={
                      active
                        ? "var(--color-primary)"
                        : e.kind === "optional"
                          ? "var(--color-status-unknown)"
                          : "var(--color-border)"
                    }
                    strokeWidth={active ? 2 : 1.25}
                    strokeDasharray={e.kind === "optional" ? "5 6" : undefined}
                    opacity={hovered && !active ? 0.25 : 0.9}
                  />
                  <text
                    x={`${(a.x + b.x) / 2}%`}
                    y={`${(a.y + b.y) / 2}%`}
                    dy="-4"
                    textAnchor="middle"
                    className="font-mono"
                    fontSize="9"
                    fill="var(--color-muted-foreground)"
                    opacity={active ? 1 : 0.45}
                  >
                    {e.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {systems.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              onMouseEnter={() => setHovered(s.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
              className={cn(
                "absolute w-44 -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-surface-2/95 p-3 text-left transition-all",
                "hover:border-primary/60 hover:shadow-[0_0_24px_-8px_var(--color-primary)]",
                s.optional ? "border-dashed border-border" : "border-border",
                isDimmed(s.id) && "opacity-35",
                selectedId === s.id && "border-primary glow-ring",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  {s.layer}
                </span>
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    s.status === "Active" && "bg-status-active",
                    s.status === "Planning" && "bg-status-planning",
                    s.status === "Experimental" && "bg-status-experimental",
                    s.status === "Paused" && "bg-status-paused",
                    s.status === "Deprecated" && "bg-status-deprecated",
                    s.status === "Unknown" && "bg-status-unknown",
                  )}
                />
              </div>
              <div className="mt-1 text-sm font-medium leading-tight">{s.name}</div>
              <div className="mt-1 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                {s.summary}
              </div>
            </button>
          ))}
        </div>
      </div>

      <SystemDrawer
        system={selected}
        systems={systems}
        systemEdges={systemEdges}
        onClose={(open) => !open && setSelectedId(null)}
      />
    </>
  );
}

function SystemDrawer({
  system,
  systems,
  systemEdges,
  onClose,
}: {
  system?: SystemNode;
  systems: SystemNode[];
  systemEdges: SystemEdge[];
  onClose: (open: boolean) => void;
}) {
  const byId = (id: string) => systems.find((s) => s.id === id)!;
  const related = system
    ? systemEdges.filter((e) => e.from === system.id || e.to === system.id)
    : [];

  return (
    <Sheet open={!!system} onOpenChange={onClose}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {system && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <StatusChip status={system.status} />
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {system.layer}
                  {system.optional ? " · 選用" : ""}
                </span>
              </div>
              <SheetTitle className="text-xl">{system.name}</SheetTitle>
              <SheetDescription>{system.summary}</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-5 text-sm">
              <Field label="角色">{system.role}</Field>
              <Field label="位置">
                <span className="font-mono text-xs">{system.location}</span>
              </Field>
              <ListField label="負責範圍" items={system.owns} />
              <ListField label="不負責範圍" items={system.doesNotOwn} />
              <ListField label="風險" items={system.risks} />
              <div>
                <Label>連線關係</Label>
                <ul className="mt-2 space-y-1.5">
                  {related.map((e, i) => {
                    const other = e.from === system.id ? byId(e.to) : byId(e.from);
                    const dir = e.from === system.id ? "→" : "←";
                    return (
                      <li
                        key={i}
                        className="flex items-center gap-2 rounded-md border border-border bg-surface-2/50 px-3 py-2"
                      >
                        <span className="font-mono text-xs text-primary">{dir}</span>
                        <span>{other.name}</span>
                        <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                          {e.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <p className="rounded-md border border-border bg-surface/60 px-3 py-2 text-xs text-muted-foreground">
                此項目為人工維護，未執行即時健康檢查。
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      <p className="mt-1 leading-relaxed">{children}</p>
    </div>
  );
}

function ListField({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <Label>{label}</Label>
      <ul className="mt-1 list-disc space-y-1 pl-4 text-muted-foreground">
        {items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
    </div>
  );
}
