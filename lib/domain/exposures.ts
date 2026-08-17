/**
 * Exposiciones (6.8 / P9). El conteo mensual nunca se muestra como cuota
 * ("n/máximo") — el texto siempre es "n exposiciones en <mes>". Un evento
 * sin `output` no cuenta (columna generada `counts` en la base, ver
 * migración); acá se asume que `counts` ya llegó calculado.
 */
import { monthNameEs } from "./dates";

export interface ExposureEventLike {
  date: string; // 'YYYY-MM-DD'
  counts: boolean;
}

function yearMonth(dateISO: string): string {
  return dateISO.slice(0, 7); // 'YYYY-MM'
}

export const monthLabel = monthNameEs;

/** Cuenta solo los eventos que sí cuentan (con output), del mes de `referenceDateISO`. */
export function countInMonth(events: ExposureEventLike[], referenceDateISO: string): number {
  const ym = yearMonth(referenceDateISO);
  return events.filter((e) => e.counts && yearMonth(e.date) === ym).length;
}

export function capReached(count: number, capPerMonth: number | null): boolean {
  if (capPerMonth == null) return false;
  return count >= capPerMonth;
}

/** P9: "2 exposiciones en agosto". Nunca "2/2". */
export function exposureSummaryText(count: number, referenceDateISO: string): string {
  const label = monthLabel(referenceDateISO);
  const noun = count === 1 ? "exposición" : "exposiciones";
  return `${count} ${noun} en ${label}`;
}
