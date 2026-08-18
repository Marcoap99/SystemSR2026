import { describe, expect, it } from "vitest";
import { contextualGreeting, type GreetingInput } from "@/lib/domain/greeting";

const BASE: GreetingInput = {
  weekNumber: 2,
  phaseRatio: 1 / 18,
  dailyStreak: { current: 3, status: "ok" },
  upcomingBoss: null,
  artifactClosedYesterday: null,
  isFridayWithoutLog: false,
};

describe("contextualGreeting", () => {
  it("por defecto usa la semana y el % de fase (redondeado)", () => {
    expect(contextualGreeting(BASE)).toBe("Semana 2. Vas 6% del camino.");
  });

  it("sin semana configurada, degrada a un saludo neutro", () => {
    expect(contextualGreeting({ ...BASE, weekNumber: null })).toBe("Bienvenido de vuelta.");
  });

  it("racha en riesgo gana sobre todo lo demás", () => {
    const input: GreetingInput = {
      ...BASE,
      dailyStreak: { current: 12, status: "warn" },
      upcomingBoss: { number: 1, daysUntil: 5 },
    };
    expect(contextualGreeting(input)).toBe("La racha está en riesgo. 5 minutos y se salva.");
  });

  it("boss cerca (≤21 días) gana sobre artefacto cerrado y racha larga", () => {
    const input: GreetingInput = {
      ...BASE,
      dailyStreak: { current: 12, status: "ok" },
      upcomingBoss: { number: 1, daysUntil: 12 },
      artifactClosedYesterday: {
        code: "G1.3",
        groupTitle: "el intake",
        groupDone: 3,
        groupTotal: 7,
      },
    };
    expect(contextualGreeting(input)).toBe("Boss 1 en 12 días. El expediente ya pesa.");
  });

  it("artefacto cerrado ayer gana sobre racha larga", () => {
    const input: GreetingInput = {
      ...BASE,
      dailyStreak: { current: 12, status: "ok" },
      artifactClosedYesterday: {
        code: "G1.3",
        groupTitle: "el intake",
        groupDone: 3,
        groupTotal: 7,
      },
    };
    expect(contextualGreeting(input)).toBe("G1.3 cerrado. Vas 3 de 7 en el intake.");
  });

  it("racha diaria de 7+ días, sin nada más urgente", () => {
    const input: GreetingInput = { ...BASE, dailyStreak: { current: 12, status: "ok" } };
    expect(contextualGreeting(input)).toBe("12 días seguidos. Eso ya es un hábito.");
  });

  it("racha de 6 días no alcanza el umbral de hábito", () => {
    const input: GreetingInput = { ...BASE, dailyStreak: { current: 6, status: "ok" } };
    expect(contextualGreeting(input)).toBe("Semana 2. Vas 6% del camino.");
  });

  it("viernes sin log de la semana, sin nada más urgente", () => {
    const input: GreetingInput = { ...BASE, isFridayWithoutLog: true };
    expect(contextualGreeting(input)).toBe("Viernes. 10 minutos de log y cierras la semana.");
  });

  it("racha de 7+ días gana sobre viernes sin log", () => {
    const input: GreetingInput = {
      ...BASE,
      dailyStreak: { current: 8, status: "ok" },
      isFridayWithoutLog: true,
    };
    expect(contextualGreeting(input)).toBe("8 días seguidos. Eso ya es un hábito.");
  });
});
