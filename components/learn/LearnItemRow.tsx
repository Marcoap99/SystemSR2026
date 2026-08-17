"use client";

import { useTransition } from "react";
import { updateLearnItemStatusAction } from "@/lib/actions/learn-items";
import type { ItemStatus, LearnItem } from "@/lib/types";

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

export function LearnItemRow({ item }: { item: LearnItem }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-2 rounded-card border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-text">
          {item.code} — {item.title}
        </p>
        <p className="mt-1 text-xs text-text-muted">
          {MODE_TEXT[item.mode] ?? item.mode}
          {item.block ? ` · Bloque ${item.block}` : ""}
          {item.target_week ? ` · Semana ${item.target_week}` : ""}
        </p>
        {item.source ? <p className="mt-1 text-xs text-text-muted">{item.source}</p> : null}
      </div>

      <select
        value={item.status}
        disabled={pending}
        onChange={(e) =>
          startTransition(() => updateLearnItemStatusAction(item.code, e.target.value as ItemStatus))
        }
        className="w-fit rounded-card border border-border px-2 py-1.5 text-sm text-text outline-none focus:border-brand disabled:opacity-60"
      >
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {STATUS_TEXT[status]}
          </option>
        ))}
      </select>
    </div>
  );
}
