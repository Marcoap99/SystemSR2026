/**
 * Saludo contextual (V1.1 C.2). Reemplaza el header plano: siempre elige
 * la primera condición que aplique de una lista fija, en orden de
 * prioridad. Nunca una frase motivacional genérica — cada rama cuelga de
 * un dato real que ya se calcula en otro lado del dominio (racha, boss,
 * artefacto, log). Función pura: toda la entrada ya viene resuelta por el
 * caller (getDisplayState, shouldShowCountdown, etc.), esto solo decide
 * y redacta.
 */

export interface DailyStreakInfo {
  current: number;
  status: "ok" | "warn";
}

export interface UpcomingBossInfo {
  number: number;
  daysUntil: number;
}

export interface ClosedArtifactInfo {
  code: string;
  groupTitle: string;
  groupDone: number;
  groupTotal: number;
}

export interface GreetingInput {
  weekNumber: number | null;
  phaseRatio: number;
  dailyStreak: DailyStreakInfo | null;
  /** Ya filtrado por shouldShowCountdown (≤21 días) — null si no aplica. */
  upcomingBoss: UpcomingBossInfo | null;
  /** El artefacto más reciente cerrado ayer, si hay alguno. */
  artifactClosedYesterday: ClosedArtifactInfo | null;
  /** Hoy es viernes y no hay ninguna entrada de log de la semana actual. */
  isFridayWithoutLog: boolean;
}

/** Las 6 condiciones de C.2, en orden — se devuelve la primera que aplica. */
export function contextualGreeting(input: GreetingInput): string {
  if (input.dailyStreak?.status === "warn") {
    return "La racha está en riesgo. 5 minutos y se salva.";
  }

  if (input.upcomingBoss) {
    return `Boss ${input.upcomingBoss.number} en ${input.upcomingBoss.daysUntil} días. El expediente ya pesa.`;
  }

  if (input.artifactClosedYesterday) {
    const { code, groupTitle, groupDone, groupTotal } = input.artifactClosedYesterday;
    return `${code} cerrado. Vas ${groupDone} de ${groupTotal} en ${groupTitle}.`;
  }

  if (input.dailyStreak && input.dailyStreak.current >= 7) {
    return `${input.dailyStreak.current} días seguidos. Eso ya es un hábito.`;
  }

  if (input.isFridayWithoutLog) {
    return "Viernes. 10 minutos de log y cierras la semana.";
  }

  if (input.weekNumber === null) {
    return "Bienvenido de vuelta.";
  }
  const pct = Math.round(Math.max(0, Math.min(1, input.phaseRatio)) * 100);
  return `Semana ${input.weekNumber}. Vas ${pct}% del camino.`;
}
