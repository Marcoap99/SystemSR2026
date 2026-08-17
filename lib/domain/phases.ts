/**
 * Desbloqueo de fases (6.6 / P5). Fase 2 se habilita cuando bosses[1] =
 * 'won'; fase 3 cuando bosses[2] = 'won'. Los artefactos de una fase
 * bloqueada se ven, pero en gris y no clickeables, con un tooltip exacto
 * (criterio de aceptación #8).
 */
import { formatShortEs } from "./dates";

export interface PhaseLike {
  number: number;
  unlocked: boolean;
  unlocked_by_boss: number | null;
}

export interface BossLike {
  number: number;
  date: string;
}

export function isPhaseLocked(phaseNumber: number, phases: PhaseLike[]): boolean {
  const phase = phases.find((p) => p.number === phaseNumber);
  return phase ? !phase.unlocked : false;
}

/** null si la fase está desbloqueada (o no existe). Si no, el texto exacto del tooltip. */
export function lockTooltip(
  phaseNumber: number,
  phases: PhaseLike[],
  bosses: BossLike[],
): string | null {
  const phase = phases.find((p) => p.number === phaseNumber);
  if (!phase || phase.unlocked) return null;

  const boss = phase.unlocked_by_boss
    ? bosses.find((b) => b.number === phase.unlocked_by_boss)
    : undefined;

  if (!boss) return "Bloqueado";

  return `Se abre con Boss ${boss.number} — ${formatShortEs(boss.date)}`;
}
