/**
 * Lógica de rachas (PRD 6.1 daily_english, 6.2 weekly_log). Funciones
 * puras: reciben estado + fecha de hoy, devuelven el próximo estado y los
 * `streak_events` a persistir. Nada de acceso a red ni a reloj acá — eso
 * vive en la capa de datos, que llama a `today()` de dates.ts una sola vez.
 */
import { addDays, diffDays, diffWeeks, mondayOf, quarterOf } from "./dates";

export type StreakKind = "daily_english" | "weekly_log";
export type StreakStatus = "ok" | "warn";
export type StreakEventAction = "marked" | "freeze" | "missed";

export interface StreakState {
  current: number;
  longest: number;
  lastMarked: string | null; // día (daily) o lunes de la semana (weekly)
  freezesTotal: number;
  freezesUsed: number;
  quarter: string; // 'YYYY-QN'
}

export interface StreakEvent {
  action: StreakEventAction;
  period: string;
}

export interface StreakDisplay {
  current: number;
  status: StreakStatus;
}

export interface ActionResult {
  state: StreakState;
  events: StreakEvent[];
}

export type FreezeError = "no_period_to_freeze" | "no_freezes_available";

/** El identificador de período de una fecha: el día mismo, o el lunes de su semana. */
function periodOf(kind: StreakKind, dateISO: string): string {
  return kind === "weekly_log" ? mondayOf(dateISO) : dateISO;
}

/** Períodos completos (kind) entre dos fechas. 0 = mismo período, 1 = el siguiente, etc. */
function periodsBetween(kind: StreakKind, fromISO: string, toISO: string): number {
  return kind === "weekly_log" ? diffWeeks(fromISO, toISO) : diffDays(fromISO, toISO);
}

function addPeriod(kind: StreakKind, periodISO: string, n: number): string {
  return kind === "weekly_log" ? addDays(periodISO, 7 * n) : addDays(periodISO, n);
}

/**
 * Reset de freezes al cambiar de trimestre. Los freezes NO se acumulan:
 * al detectar un trimestre nuevo, freezes_total vuelve a 2 y freezes_used
 * a 0 — los no usados del trimestre anterior se pierden. Sin esta regla la
 * escasez (lo que hace funcionar el freeze) desaparece.
 */
export function rolloverFreezesIfNeeded(state: StreakState, todayISO: string): StreakState {
  const currentQuarter = quarterOf(todayISO);
  if (currentQuarter === state.quarter) return state;
  return { ...state, freezesTotal: 2, freezesUsed: 0, quarter: currentQuarter };
}

/**
 * Estado a mostrar en pantalla — de solo lectura, no persiste nada. Existe
 * para que el dashboard sea honesto incluso si el usuario no abrió la app
 * el día exacto en que la racha se hubiera roto (evaluación perezosa).
 *
 * gap<=1: sin salto (0 = ya marcado hoy, 1 = el período anterior fue el
 * último marcado). gap===2: se saltó 1 período → warn, current intacto.
 * gap>=3: se saltaron 2+ períodos consecutivos → roto, current en 0.
 */
export function getDisplayState(
  state: StreakState,
  kind: StreakKind,
  todayISO: string,
): StreakDisplay {
  if (!state.lastMarked) {
    return { current: state.current, status: "ok" };
  }
  const gap = periodsBetween(kind, state.lastMarked, todayISO);
  if (gap <= 1) return { current: state.current, status: "ok" };
  if (gap === 2) return { current: state.current, status: "warn" };
  return { current: 0, status: "ok" };
}

/**
 * Concilia el estado persistido contra "hoy": aplica el rollover de
 * trimestre y, si corresponde, el reset a 0 + el streak_event `missed`.
 * Se llama siempre antes de procesar una acción nueva (marcar/freeze), y
 * puede llamarse también al cargar el dashboard para que la base refleje
 * la realidad sin depender de un cron.
 */
export function settle(state: StreakState, kind: StreakKind, todayISO: string): ActionResult {
  const rolled = rolloverFreezesIfNeeded(state, todayISO);

  if (!rolled.lastMarked) {
    return { state: rolled, events: [] };
  }

  const gap = periodsBetween(kind, rolled.lastMarked, todayISO);
  if (gap < 3) {
    return { state: rolled, events: [] };
  }

  const missedPeriod = addPeriod(kind, rolled.lastMarked, 1);
  return {
    state: { ...rolled, current: 0 },
    events: [{ action: "missed", period: missedPeriod }],
  };
}

/**
 * Marca el período de hoy. Idempotente: marcar dos veces el mismo día no
 * incrementa dos veces. Si current > longest tras marcar, longest sube.
 */
export function markPeriod(state: StreakState, kind: StreakKind, todayISO: string): ActionResult {
  const settled = settle(state, kind, todayISO);
  const period = periodOf(kind, todayISO);

  if (settled.state.lastMarked === period) {
    return settled; // ya marcado este período — no-op
  }

  const current = settled.state.current + 1;
  const longest = Math.max(settled.state.longest, current);

  return {
    state: { ...settled.state, current, longest, lastMarked: period },
    events: [...settled.events, { action: "marked", period }],
  };
}

/**
 * Congela el período saltado (dentro de las 48h de tolerancia, es decir
 * exactamente 1 período saltado — el estado `warn`). Conserva `current`,
 * descuenta un freeze del cupo del trimestre.
 */
export function applyFreeze(
  state: StreakState,
  kind: StreakKind,
  todayISO: string,
): ActionResult | { error: FreezeError } {
  const rolled = rolloverFreezesIfNeeded(state, todayISO);

  if (!rolled.lastMarked) {
    return { error: "no_period_to_freeze" };
  }

  const gap = periodsBetween(kind, rolled.lastMarked, todayISO);
  if (gap !== 2) {
    return { error: "no_period_to_freeze" };
  }

  if (rolled.freezesUsed >= rolled.freezesTotal) {
    return { error: "no_freezes_available" };
  }

  const frozenPeriod = addPeriod(kind, rolled.lastMarked, 1);

  return {
    state: { ...rolled, freezesUsed: rolled.freezesUsed + 1, lastMarked: frozenPeriod },
    events: [{ action: "freeze", period: frozenPeriod }],
  };
}
