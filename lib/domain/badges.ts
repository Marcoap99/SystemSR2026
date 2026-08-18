/**
 * Insignias (V1.1 C.3) — regla dura: se ganan por evidencia de producción,
 * nunca por consumo. Ninguna condición de acá toca learn_items ni
 * resources; todas cuelgan de resultados, rachas largas, un boss ganado o
 * una exposición contada. Función pura: recibe el estado ya resuelto
 * (mapas/booleans) y devuelve qué insignias están ganadas — cero acceso a
 * red acá, eso vive en la capa de datos.
 */

export type BadgeId =
  | "arquitecto"
  | "traductor"
  | "experimentador"
  | "bibliotecario"
  | "referente"
  | "constante"
  | "cronista"
  | "expositor"
  | "superviviente"
  | "titular";

export interface BadgeDef {
  id: BadgeId;
  label: string;
  icon: string;
  earnedWith: string;
}

/** Orden fijo de despliegue — no depende de cuáles estén ganadas. */
export const BADGES: BadgeDef[] = [
  { id: "arquitecto", label: "Arquitecto", icon: "🏗", earnedWith: "L1 — El intake adoptado" },
  { id: "traductor", label: "Traductor", icon: "💱", earnedWith: "L2 — Una decisión movida por tu research" },
  { id: "experimentador", label: "Experimentador", icon: "🧪", earnedWith: "L3 — Un experimento corrido" },
  { id: "bibliotecario", label: "Bibliotecario", icon: "📚", earnedWith: "L4 — El repositorio consultado por otro" },
  { id: "referente", label: "Referente", icon: "🎖", earnedWith: "L5 — Reconocimiento explícito" },
  { id: "constante", label: "Constante", icon: "🔥", earnedWith: "30 días de racha diaria" },
  { id: "cronista", label: "Cronista", icon: "📋", earnedWith: "8 semanas seguidas de log" },
  { id: "expositor", label: "Expositor", icon: "🎤", earnedWith: "EX4 — Diste una charla" },
  { id: "superviviente", label: "Superviviente", icon: "🛡", earnedWith: "Boss 1 ganado" },
  { id: "titular", label: "Titular", icon: "👑", earnedWith: 'L6 — Puesto sin "Jr"' },
];

export interface BadgeEvaluationInput {
  /** achieved de cada results.code presente ('L1'..'L6'). */
  resultAchieved: Partial<Record<string, boolean>>;
  /** achieved_at de cada results.code, cuando existe. */
  resultAchievedAt: Partial<Record<string, string | null>>;
  dailyStreakLongest: number;
  weeklyLogStreakLongest: number;
  /** true si hay al menos un exposure_event que cuenta para EX4. */
  ex4Counted: boolean;
  /** fecha del exposure_event más reciente que cuenta para EX4, si hay. */
  ex4CountedAt: string | null;
  boss1Won: boolean;
  /** fecha del boss (no de cuándo se ganó — no se guarda esa marca). */
  boss1Date: string | null;
}

export interface BadgeState {
  id: BadgeId;
  earned: boolean;
  earnedAt: string | null;
}

function resultBadge(
  code: string,
  input: BadgeEvaluationInput,
): { earned: boolean; earnedAt: string | null } {
  return {
    earned: input.resultAchieved[code] === true,
    earnedAt: input.resultAchievedAt[code] ?? null,
  };
}

/** Evalúa las 10 insignias contra el estado actual. Orden = BADGES. */
export function evaluateBadges(input: BadgeEvaluationInput): BadgeState[] {
  return BADGES.map(({ id }) => {
    switch (id) {
      case "arquitecto":
        return { id, ...resultBadge("L1", input) };
      case "traductor":
        return { id, ...resultBadge("L2", input) };
      case "experimentador":
        return { id, ...resultBadge("L3", input) };
      case "bibliotecario":
        return { id, ...resultBadge("L4", input) };
      case "referente":
        return { id, ...resultBadge("L5", input) };
      case "titular":
        return { id, ...resultBadge("L6", input) };
      case "constante":
        return { id, earned: input.dailyStreakLongest >= 30, earnedAt: null };
      case "cronista":
        return { id, earned: input.weeklyLogStreakLongest >= 8, earnedAt: null };
      case "expositor":
        return { id, earned: input.ex4Counted, earnedAt: input.ex4CountedAt };
      case "superviviente":
        return { id, earned: input.boss1Won, earnedAt: input.boss1Won ? input.boss1Date : null };
    }
  });
}
