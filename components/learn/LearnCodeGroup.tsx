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
};

/** Bloque A: un learn_item con sus recursos concretos debajo. */
export function LearnCodeGroup({
  item,
  resources,
  progress,
}: {
  item: LearnItem;
  resources: Resource[];
  progress: GroupProgress;
}) {
  const [pending, startTransition] = useTransition();

  if (resources.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-card border border-border p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-text">
            <span className="font-mono">{item.code}</span> — {item.title}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {MODE_TEXT[item.mode] ?? item.mode}
            {item.block ? ` · Bloque ${item.block}` : ""}
            {item.target_week ? ` · Semana ${item.target_week}` : ""}
          </p>
        </div>

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
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  );
}
