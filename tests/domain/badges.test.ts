import { describe, expect, it } from "vitest";
import { BADGES, evaluateBadges, type BadgeEvaluationInput } from "@/lib/domain/badges";

const EMPTY: BadgeEvaluationInput = {
  resultAchieved: {},
  resultAchievedAt: {},
  dailyStreakLongest: 0,
  weeklyLogStreakLongest: 0,
  ex4Counted: false,
  ex4CountedAt: null,
  boss1Won: false,
  boss1Date: null,
};

describe("evaluateBadges", () => {
  it("ninguna insignia ganada por defecto, y devuelve las 10 en el orden fijo", () => {
    const states = evaluateBadges(EMPTY);
    expect(states).toHaveLength(10);
    expect(states.map((s) => s.id)).toEqual(BADGES.map((b) => b.id));
    expect(states.every((s) => !s.earned)).toBe(true);
  });

  it("las insignias L1-L6 y L6 cuelgan de results.achieved, no de resources", () => {
    const input: BadgeEvaluationInput = {
      ...EMPTY,
      resultAchieved: { L1: true, L4: true },
      resultAchievedAt: { L1: "2026-10-05", L4: null },
    };
    const states = evaluateBadges(input);
    expect(states.find((s) => s.id === "arquitecto")).toEqual({
      id: "arquitecto",
      earned: true,
      earnedAt: "2026-10-05",
    });
    expect(states.find((s) => s.id === "bibliotecario")).toEqual({
      id: "bibliotecario",
      earned: true,
      earnedAt: null,
    });
    expect(states.find((s) => s.id === "traductor")?.earned).toBe(false);
  });

  it("constante requiere racha diaria más larga registrada >= 30, no la actual", () => {
    expect(
      evaluateBadges({ ...EMPTY, dailyStreakLongest: 29 }).find((s) => s.id === "constante")
        ?.earned,
    ).toBe(false);
    expect(
      evaluateBadges({ ...EMPTY, dailyStreakLongest: 30 }).find((s) => s.id === "constante")
        ?.earned,
    ).toBe(true);
  });

  it("cronista requiere 8+ semanas seguidas de log", () => {
    expect(
      evaluateBadges({ ...EMPTY, weeklyLogStreakLongest: 8 }).find((s) => s.id === "cronista")
        ?.earned,
    ).toBe(true);
  });

  it("expositor solo se gana con un exposure_event de EX4 que cuenta, nunca con ver un recurso", () => {
    const state = evaluateBadges({
      ...EMPTY,
      ex4Counted: true,
      ex4CountedAt: "2026-11-20",
    }).find((s) => s.id === "expositor");
    expect(state).toEqual({ id: "expositor", earned: true, earnedAt: "2026-11-20" });
  });

  it("superviviente solo con el boss 1 ganado; la fecha es la del boss, no una marca inexistente", () => {
    const state = evaluateBadges({
      ...EMPTY,
      boss1Won: true,
      boss1Date: "2026-11-10",
    }).find((s) => s.id === "superviviente");
    expect(state).toEqual({ id: "superviviente", earned: true, earnedAt: "2026-11-10" });
  });
});
