/**
 * Barras de progreso (6.3, 6.5). Siempre derivadas, nunca persistidas
 * como porcentaje: se recalculan a partir de los artefactos o de la
 * semana actual cada vez que se piden.
 */

export interface ArtifactLike {
  status: string;
}

export interface GroupProgress {
  done: number;
  total: number;
  ratio: number;
}

/** progreso(grupo) = artifacts[status='done'].length / artifacts.length */
export function groupProgress(artifacts: ArtifactLike[]): GroupProgress {
  const total = artifacts.length;
  const done = artifacts.filter((a) => a.status === "done").length;
  return { done, total, ratio: total === 0 ? 0 : done / total };
}

export type ProgressVisualState = "empty" | "partial" | "complete";

export function progressVisualState(ratio: number): ProgressVisualState {
  if (ratio >= 1) return "complete";
  if (ratio > 0) return "partial";
  return "empty";
}

/**
 * progreso(fase) = (semana_actual - 1) / 18. Semanas 2 a 19 son el rango
 * útil (18 semanas); se recorta a [0, 1] fuera de ese rango.
 */
export function phaseProgress(currentWeekNumber: number): number {
  const ratio = (currentWeekNumber - 1) / 18;
  return Math.max(0, Math.min(1, ratio));
}
