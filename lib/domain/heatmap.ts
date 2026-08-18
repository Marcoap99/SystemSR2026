/**
 * Heatmap de actividad (V1.1 C.4). Estilo GitHub: un día por celda, 5
 * niveles de intensidad según cuántos eventos hubo. Función pura — recibe
 * la lista ya resuelta de eventos con fecha (América/Lima) y etiqueta, y
 * arma la grilla completa del rango, incluidos los días en 0. La capa de
 * datos es la que junta los eventos desde varias tablas (racha marcada,
 * artefacto cerrado, recurso completado, log, conexión, exposición).
 */
import { addDays } from "./dates";

export type IntensityLevel = 0 | 1 | 2 | 3 | 4;

export interface ActivityEvent {
  date: string; // 'YYYY-MM-DD', ya en América/Lima
  label: string;
}

export interface HeatmapDay {
  date: string;
  count: number;
  level: IntensityLevel;
  labels: string[];
}

/** Cortes iguales a los del contribution graph de GitHub: 0 / 1 / 2 / 3-4 / 5+. */
function levelFor(count: number): IntensityLevel {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

/** Arma la grilla día a día entre `fromISO` y `toISO`, ambos incluidos. */
export function buildHeatmap(events: ActivityEvent[], fromISO: string, toISO: string): HeatmapDay[] {
  const byDate = new Map<string, string[]>();
  for (const e of events) {
    if (e.date < fromISO || e.date > toISO) continue;
    const labels = byDate.get(e.date) ?? [];
    labels.push(e.label);
    byDate.set(e.date, labels);
  }

  const days: HeatmapDay[] = [];
  let cursor = fromISO;
  while (cursor <= toISO) {
    const labels = byDate.get(cursor) ?? [];
    days.push({ date: cursor, count: labels.length, level: levelFor(labels.length), labels });
    cursor = addDays(cursor, 1);
  }
  return days;
}

export function activeDaysCount(days: HeatmapDay[]): number {
  return days.filter((d) => d.count > 0).length;
}
