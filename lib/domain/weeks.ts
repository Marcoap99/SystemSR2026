/**
 * Semana actual (PRD 7.1 header). Se determina por `today()` entre
 * start_date y end_date. Si hoy cae fuera de todo el rango del plan,
 * degrada a la semana más cercana en vez de romper la pantalla.
 */

export interface WeekLike {
  number: number;
  start_date: string;
  end_date: string;
}

export function currentWeek<T extends WeekLike>(weeks: T[], todayISO: string): T | null {
  if (weeks.length === 0) return null;

  const inRange = weeks.find((w) => w.start_date <= todayISO && todayISO <= w.end_date);
  if (inRange) return inRange;

  const sorted = [...weeks].sort((a, b) => a.start_date.localeCompare(b.start_date));
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;

  // Antes de que arranque el plan: primera semana. Después del final
  // (o entre huecos de datos): última semana conocida.
  return todayISO < first.start_date ? first : last;
}

/** Semanas 20 y 21 son "fiestas": sin quests, se muestra la semana pero sin pedir nada. */
export function isFiestas(week: { load: string }): boolean {
  return week.load === "fiestas";
}
