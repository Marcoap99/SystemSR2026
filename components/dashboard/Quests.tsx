"use client";

import { useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { toggleQuestAction } from "@/lib/actions/quests";
import type { Quest } from "@/lib/types";

const TYPE_LABEL: Record<string, string> = {
  ejecutar: "Ejecutar",
  aprender: "Aprender",
  conectar: "Conectar",
  bonus: "Bonus",
};

/** 7.1 (3): 3-4 tarjetas (ejecutar/aprender/conectar/bonus) con checkbox. */
export function Quests({ quests, isFiestas }: { quests: Quest[]; isFiestas: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <Card>
      <h2 className="text-lg font-semibold text-text">Quest de la semana</h2>

      {isFiestas ? (
        <p className="mt-3 text-sm text-text-muted">Semana de fiestas — no se planifican quests.</p>
      ) : quests.length === 0 ? (
        <p className="mt-3 text-sm text-text-muted">Todavía no hay quests cargadas para esta semana.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {quests.map((q) => (
            <label
              key={q.id}
              className="flex items-start gap-3 rounded-card border border-border p-3 hover:bg-bg"
            >
              <input
                type="checkbox"
                checked={q.done}
                disabled={pending}
                onChange={() => startTransition(() => toggleQuestAction(q.id, !q.done))}
                className="mt-1 h-4 w-4 accent-brand"
              />
              <span>
                <span className="block text-xs font-semibold tracking-wide text-text-muted uppercase">
                  {TYPE_LABEL[q.type] ?? q.type}
                </span>
                <span className={"block text-sm " + (q.done ? "text-text-muted line-through" : "text-text")}>
                  {q.title}
                </span>
                {q.ref_code ? <span className="mt-0.5 block text-xs text-text-muted">{q.ref_code}</span> : null}
              </span>
            </label>
          ))}
        </div>
      )}
    </Card>
  );
}
