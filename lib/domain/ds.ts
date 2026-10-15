/**
 * Daily System Marco: lógica pura (sin reloj ni base). Todas las funciones
 * reciben "hoy" como 'YYYY-MM-DD' (ver lib/domain/dates.ts).
 */
import { addDays, diffDays } from "@/lib/domain/dates";

export type Lane = "A" | "B" | "C";

/** Metas semanales de horas por carril (brief: A 8, B 10, C 9,5). */
export const LANE_TARGET_H: Record<Lane, number> = { A: 8, B: 10, C: 9.5 };

export const LANE_NAME: Record<Lane, string> = {
  A: "Empleo",
  B: "Ingreso puente",
  C: "Estudio",
};

export const LANE_COLOR: Record<Lane, string> = {
  A: "#9b6bff",
  B: "#00cb75",
  C: "#4da6ff",
};

export interface DsWeek {
  number: number;
  starts_on: string;
  ends_on: string;
}

/** Semana de la temporada que contiene `todayISO`; null si estamos fuera de las 10 semanas. */
export function currentDsWeek(todayISO: string, weeks: DsWeek[]): DsWeek | null {
  return weeks.find((w) => todayISO >= w.starts_on && todayISO <= w.ends_on) ?? null;
}

/** Días hasta el arranque (>0 antes de empezar), o null si ya empezó. */
export function daysToStart(todayISO: string, weeks: DsWeek[]): number | null {
  const first = [...weeks].sort((a, b) => a.number - b.number)[0];
  if (!first) return null;
  const d = diffDays(todayISO, first.starts_on);
  return d > 0 ? d : null;
}

/** Fracción 0..1 de avance de un carril (tope en 1). */
export function laneProgress(lane: Lane, hours: number): number {
  const target = LANE_TARGET_H[lane];
  if (hours <= 0) return 0;
  return Math.min(1, hours / target);
}

/** Lunes de la semana calendario de `todayISO` (semana de trabajo lunes a viernes). */
export function mondayOf(todayISO: string): string {
  const [y, m, d] = todayISO.split("-").map(Number) as [number, number, number];
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = domingo
  return addDays(todayISO, -((dow + 6) % 7));
}

export function greetingFor(hour: number): string {
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

export interface DsTask {
  id: string;
  lane: Lane;
  title: string;
  status: "pending" | "done" | "skipped";
  result_rank: number | null;
}

/** Los 3 resultados del día, numerados 01..03 por su orden en pantalla. */
export function dayResults(tasks: DsTask[]): { n: string; task: DsTask }[] {
  return [...tasks]
    .sort((a, b) => (a.result_rank ?? 99) - (b.result_rank ?? 99))
    .slice(0, 3)
    .map((task, i) => ({ n: String(i + 1).padStart(2, "0"), task }));
}

export type NucleoCommand =
  | { kind: "today" }
  | { kind: "mark"; n: number }
  | { kind: "open"; target: "nucleo" | "aprender" | "carriles" | "domingo" }
  | { kind: "minimum" }
  | { kind: "hours" }
  | { kind: "unknown" };

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[¿?¡!.,]/g, "")
    .trim();

/** Comandos V1 de la barra (texto o voz). */
export function parseCommand(input: string): NucleoCommand {
  const t = norm(input);
  if (/^(que tengo hoy|que hay hoy|hoy)$/.test(t)) return { kind: "today" };
  const mark = t.match(/^marca(?:r)? (?:el )?0?([1-3])$/);
  if (mark) return { kind: "mark", n: Number(mark[1]) };
  if (/(dia minimo viable|minimo viable)/.test(t)) return { kind: "minimum" };
  if (/(cuantas horas llevo|horas llevo|mis horas)/.test(t)) return { kind: "hours" };
  if (/(volver al nucleo|abre nucleo|abrir nucleo|ir al nucleo)/.test(t)) return { kind: "open", target: "nucleo" };
  const open = t.match(/^(?:abre|abrir|ve a|ir a) (aprender|carriles|domingo)$/);
  if (open) return { kind: "open", target: open[1] as "aprender" | "carriles" | "domingo" };
  return { kind: "unknown" };
}

/** Último día laborable (lun-vie) estrictamente anterior a `todayISO`. */
export function previousWorkday(todayISO: string): string {
  let d = addDays(todayISO, -1);
  for (let i = 0; i < 7; i++) {
    const [y, m, day] = d.split("-").map(Number) as [number, number, number];
    const dow = new Date(Date.UTC(y, m - 1, day)).getUTCDay();
    if (dow >= 1 && dow <= 5) return d;
    d = addDays(d, -1);
  }
  return d;
}

/**
 * Regla "nunca dos días en cero": avisa si el día laborable anterior no tuvo
 * actividad y hoy tampoco (solo en temporada, en día laborable).
 */
export function zeroDayAlert(todayISO: string, seasonStart: string, activeDays: Set<string>): boolean {
  if (todayISO < seasonStart) return false;
  const [y, m, d] = todayISO.split("-").map(Number) as [number, number, number];
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  if (dow < 1 || dow > 5) return false;
  return !activeDays.has(previousWorkday(todayISO)) && !activeDays.has(todayISO);
}
