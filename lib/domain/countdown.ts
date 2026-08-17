/**
 * Contador regresivo (6.7 / P4). Oculto por defecto — el balance white
 * hat / black hat del sistema (sección 2) depende de que esto NO se
 * muestre salvo que un boss fight esté realmente cerca.
 */
import { diffDays } from "./dates";

export interface BossLike {
  date: string;
  status: string;
}

/** El primer boss con status='pending', ordenado por fecha. */
export function nextPendingBoss<T extends BossLike>(bosses: T[]): T | null {
  const pending = bosses
    .filter((b) => b.status === "pending")
    .sort((a, b) => a.date.localeCompare(b.date));
  return pending[0] ?? null;
}

export function daysUntil(dateISO: string, todayISO: string): number {
  return diffDays(todayISO, dateISO);
}

/** mostrar_contador = (proximo_boss.date - hoy) <= 21 días */
export function shouldShowCountdown(bossDateISO: string, todayISO: string): boolean {
  return daysUntil(bossDateISO, todayISO) <= 21;
}
