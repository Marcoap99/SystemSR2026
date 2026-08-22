"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { ActivityHeatmap } from "@/components/dashboard/ActivityHeatmap";
import { ActivityBarChart } from "@/components/dashboard/ActivityBarChart";
import type { HeatmapDay } from "@/lib/domain/heatmap";

type View = "calendario" | "reciente";
type Range = 7 | 14 | 30;

const RANGES: Range[] = [7, 14, 30];

/**
 * V1.5 — el bloque de actividad (V1.1 C.4) gana una segunda vista que
 * complementa al calendario: el mismo dato (HeatmapDay[], ya viene de
 * getHeatmapData con 6 meses), nomás recortado a los últimos 7/14/30
 * días y mostrado como barras en vez de celdas de color -- el
 * calendario muestra el patrón largo, esto muestra el pulso reciente.
 * Es descriptivo (cuánto hiciste), nunca comparativo ni una meta
 * numérica -- no es un puntaje.
 */
export function ActivitySection({ days, activeDays }: { days: HeatmapDay[]; activeDays: number }) {
  const [view, setView] = useState<View>("calendario");
  const [range, setRange] = useState<Range>(14);

  const recentDays = days.slice(-range);
  const activeInRange = recentDays.filter((d) => d.count > 0).length;

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-text">Actividad</h2>
        <div className="flex gap-1 rounded-card border border-border bg-bg p-1">
          <button
            type="button"
            onClick={() => setView("calendario")}
            className={
              "rounded-badge px-3 py-1 text-xs font-medium transition-colors " +
              (view === "calendario" ? "bg-brand/10 text-brand-dark" : "text-text-muted hover:text-text")
            }
          >
            Calendario
          </button>
          <button
            type="button"
            onClick={() => setView("reciente")}
            className={
              "rounded-badge px-3 py-1 text-xs font-medium transition-colors " +
              (view === "reciente" ? "bg-brand/10 text-brand-dark" : "text-text-muted hover:text-text")
            }
          >
            Reciente
          </button>
        </div>
      </div>

      <div className="mt-4">
        {view === "calendario" ? (
          <ActivityHeatmap days={days} activeDays={activeDays} />
        ) : (
          <>
            <div className="flex justify-end gap-1">
              {RANGES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={
                    "rounded-badge px-2.5 py-1 text-xs font-medium transition-colors " +
                    (range === r ? "bg-brand/10 text-brand-dark" : "text-text-muted hover:bg-bg hover:text-text")
                  }
                >
                  {r}d
                </button>
              ))}
            </div>
            <div className="mt-3">
              <ActivityBarChart days={recentDays} />
            </div>
            <p className="mt-3 text-xs text-text-muted">
              <span className="font-mono">{activeInRange}</span> de los últimos {range} días con actividad
            </p>
          </>
        )}
      </div>
    </Card>
  );
}
