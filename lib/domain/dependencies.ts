/**
 * V1.2 — bloqueo por dependencia (`blocked_by`). Mismo tratamiento visual
 * que el bloqueo de fase (6.6): gris, no clickeable, tooltip exacto. La
 * diferencia es qué lo desbloquea -- acá, que OTRO ítem (learn_item o
 * artifact, cualquiera de los dos, por eso el lookup es un solo mapa
 * combinado) llegue a `status = 'done'`, no un boss ganado.
 */

export interface DoneLookup {
  [code: string]: boolean;
}

export function isDependencyBlocked(blockedBy: string | null, doneByCode: DoneLookup): boolean {
  if (!blockedBy) return false;
  return doneByCode[blockedBy] !== true;
}

/** null si no está bloqueado. Si no, el texto exacto del tooltip (criterio de aceptación #2). */
export function dependencyTooltip(blockedBy: string | null, doneByCode: DoneLookup): string | null {
  if (!isDependencyBlocked(blockedBy, doneByCode)) return null;
  return `Se habilita al cerrar ${blockedBy}`;
}
