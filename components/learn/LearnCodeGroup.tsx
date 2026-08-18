"use client";

import { useTransition } from "react";
import { updateLearnItemStatusAction } from "@/lib/actions/learn-items";
import { ResourceCard } from "@/components/learn/ResourceCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { GroupProgress } from "@/lib/domain/progress";
import type { ItemStatus, LearnItem, Resource } from "@/lib/types";

const STATUS_OPTIONS: ItemStatus[] = ["pending", "in_progress", "done"];
const STATUS_TEXT: Record<ItemStatus, string> = {
  pending: "Pendiente",
  in_progress: "En curso",
  done: "Hecho",
};

const MODE_TEXT: Record<string, string> = {
  bloque: "Bloque",
  chamba: "Chamba",
  tiempo_muerto: "Tiempo muerto",
  micro: "Micro",
  // V1.2: AR3 pasa a este modo -- se activa solo si el jefe decide
  // testear en vez de deployar, no tiene semana fija.
  just_in_time: "Según necesidad",
};

/** Bloque A + V1.2: un learn_item con sus recursos concretos debajo. */
export function LearnCodeGroup({
  item,
  resources,
  progress,
  locked,
  lockReason,
}: {
  item: LearnItem;
  resources: Resource[];
  progress: GroupProgress;
  locked: boolean;
  lockReason: string | null;
}) {
  const [pending, startTransition] = useTransition();

  if (resources.length === 0) return null;

  return (
    <div
      className={
        "flex flex-col gap-3 rounded-card border border-border p-4 " +
        (locked ? "bg-bg opacity-70 grayscale-[0.4] hover:animate-shake" : "")
      }
      title={locked ? (lockReason ?? undefined) : undefined}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          {locked ? (
            <span className="mt-0.5 shrink-0 text-locked" aria-hidden="true" title={lockReason ?? undefined}>
              🔒
            </span>
          ) : null}
          <div>
            <p className={"text-sm font-semibold " + (locked ? "text-locked" : "text-text")}>
              <span className="font-mono">{item.code}</span> — {item.title}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {MODE_TEXT[item.mode] ?? item.mode}
              {item.block ? ` · Bloque ${item.block}` : ""}
              {item.target_week ? ` · Semana ${item.target_week}` : ""}
            </p>
          </div>
        </div>

        {locked ? (
          <span
            className="w-fit shrink-0 rounded-badge bg-bg px-2 py-1 text-xs font-medium text-locked backdrop-blur-sm"
            title={lockReason ?? undefined}
          >
            {STATUS_TEXT[item.status]}
          </span>
        ) : (
          <select
            value={item.status}
            disabled={pending}
            onChange={(e) =>
              startTransition(() => updateLearnItemStatusAction(item.code, e.target.value as ItemStatus))
            }
            className="w-fit shrink-0 rounded-card border border-border px-2 py-1.5 text-sm text-text outline-none focus:border-brand disabled:opacity-60"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {STATUS_TEXT[status]}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <ProgressBar ratio={progress.ratio} showCheck={false} />
        </div>
        <span className="shrink-0 font-mono text-xs text-text-muted tabular-nums">
          {progress.done}/{progress.total}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {resources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} locked={locked} />
        ))}
      </div>
    </div>
  );
}
