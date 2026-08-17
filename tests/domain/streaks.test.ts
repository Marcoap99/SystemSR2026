import { describe, expect, it } from "vitest";
import {
  applyFreeze,
  getDisplayState,
  markPeriod,
  rolloverFreezesIfNeeded,
  settle,
  type StreakState,
} from "@/lib/domain/streaks";

function freshState(overrides: Partial<StreakState> = {}): StreakState {
  return {
    current: 0,
    longest: 0,
    lastMarked: null,
    freezesTotal: 2,
    freezesUsed: 0,
    quarter: "2026-Q3",
    ...overrides,
  };
}

describe("daily_english — marcar", () => {
  it("primera marca: current pasa a 1 y se registra el evento", () => {
    const { state, events } = markPeriod(freshState(), "daily_english", "2026-08-17");
    expect(state.current).toBe(1);
    expect(state.longest).toBe(1);
    expect(state.lastMarked).toBe("2026-08-17");
    expect(events).toEqual([{ action: "marked", period: "2026-08-17" }]);
  });

  it("marcar día consecutivo incrementa current (criterio de aceptación #3)", () => {
    const day1 = markPeriod(freshState(), "daily_english", "2026-08-17");
    const day2 = markPeriod(day1.state, "daily_english", "2026-08-18");
    expect(day2.state.current).toBe(2);
    expect(day2.state.longest).toBe(2);
  });

  it("marcar el mismo día dos veces es idempotente (no incrementa dos veces)", () => {
    const first = markPeriod(freshState(), "daily_english", "2026-08-17");
    const again = markPeriod(first.state, "daily_english", "2026-08-17");
    expect(again.state.current).toBe(1);
    expect(again.events).toEqual([]);
  });

  it("longest se actualiza solo cuando current lo supera", () => {
    const state = freshState({ current: 3, longest: 5, lastMarked: "2026-08-17" });
    const { state: next } = markPeriod(state, "daily_english", "2026-08-18");
    expect(next.current).toBe(4);
    expect(next.longest).toBe(5);
  });
});

describe("daily_english — tolerancia y reset (criterio de aceptación #4)", () => {
  it("saltar 1 día muestra warn sin romper la racha", () => {
    const state = freshState({ current: 5, longest: 5, lastMarked: "2026-08-17" });
    const display = getDisplayState(state, "daily_english", "2026-08-19"); // saltó el 18
    expect(display.status).toBe("warn");
    expect(display.current).toBe(5);
  });

  it("saltar 2 días consecutivos resetea current a 0 (display)", () => {
    const state = freshState({ current: 5, longest: 5, lastMarked: "2026-08-17" });
    const display = getDisplayState(state, "daily_english", "2026-08-20"); // saltó 18 y 19
    expect(display.status).toBe("ok");
    expect(display.current).toBe(0);
  });

  it("settle() persiste el reset y registra un evento missed", () => {
    const state = freshState({ current: 5, longest: 5, lastMarked: "2026-08-17" });
    const { state: next, events } = settle(state, "daily_english", "2026-08-20");
    expect(next.current).toBe(0);
    expect(next.longest).toBe(5); // longest no se toca al romperse
    expect(events).toEqual([{ action: "missed", period: "2026-08-18" }]);
  });

  it("marcar después de un reset arranca la racha en 1, no sigue sumando", () => {
    const state = freshState({ current: 5, longest: 5, lastMarked: "2026-08-17" });
    const { state: next } = markPeriod(state, "daily_english", "2026-08-20");
    expect(next.current).toBe(1);
  });
});

describe("daily_english — freeze (criterio de aceptación #5)", () => {
  it("aplicar un freeze conserva current y descuenta freezes_used", () => {
    const state = freshState({ current: 5, longest: 5, lastMarked: "2026-08-17", freezesUsed: 0 });
    const result = applyFreeze(state, "daily_english", "2026-08-19"); // 1 día saltado
    if ("error" in result) throw new Error("no debería fallar");
    expect(result.state.current).toBe(5);
    expect(result.state.freezesUsed).toBe(1);
    expect(result.events).toEqual([{ action: "freeze", period: "2026-08-18" }]);
  });

  it("después del freeze, la racha sigue viva (no entra en warn ni se resetea)", () => {
    const state = freshState({ current: 5, longest: 5, lastMarked: "2026-08-17" });
    const frozen = applyFreeze(state, "daily_english", "2026-08-19");
    if ("error" in frozen) throw new Error("no debería fallar");
    const display = getDisplayState(frozen.state, "daily_english", "2026-08-19");
    expect(display.status).toBe("ok");
    expect(display.current).toBe(5);
  });

  it("no se puede aplicar freeze sin freezes disponibles", () => {
    const state = freshState({
      current: 5,
      lastMarked: "2026-08-17",
      freezesUsed: 2,
      freezesTotal: 2,
    });
    const result = applyFreeze(state, "daily_english", "2026-08-19");
    expect(result).toEqual({ error: "no_freezes_available" });
  });

  it("no se puede aplicar freeze si no hay nada saltado", () => {
    const state = freshState({ current: 5, lastMarked: "2026-08-17" });
    const result = applyFreeze(state, "daily_english", "2026-08-17");
    expect(result).toEqual({ error: "no_period_to_freeze" });
  });
});

describe("weekly_log", () => {
  it("marca la semana en curso al crear un log_entry (criterio de aceptación #6, vía markPeriod)", () => {
    // Semana del 2026-08-17 (lunes) al 2026-08-23.
    const { state } = markPeriod(freshState(), "weekly_log", "2026-08-19");
    expect(state.current).toBe(1);
    expect(state.lastMarked).toBe("2026-08-17"); // normalizado al lunes
  });

  it("misma semana marcada dos veces no duplica el evento", () => {
    const first = markPeriod(freshState(), "weekly_log", "2026-08-19");
    const again = markPeriod(first.state, "weekly_log", "2026-08-21");
    expect(again.state.current).toBe(1);
    expect(again.events).toEqual([]);
  });

  it("saltar 1 semana es warn, saltar 2 semanas resetea", () => {
    const state = freshState({ current: 3, longest: 3, lastMarked: "2026-08-17" });
    const warn = getDisplayState(state, "weekly_log", "2026-08-31"); // saltó la del 24
    expect(warn.status).toBe("warn");

    const broken = getDisplayState(state, "weekly_log", "2026-09-07"); // saltó 24 y 31
    expect(broken.current).toBe(0);
  });
});

describe("reset trimestral de freezes", () => {
  it("no cambia nada dentro del mismo trimestre", () => {
    const state = freshState({ freezesUsed: 1, quarter: "2026-Q3" });
    const rolled = rolloverFreezesIfNeeded(state, "2026-09-20");
    expect(rolled).toEqual(state);
  });

  it("al cruzar de trimestre, freezes_used vuelve a 0 y freezes_total a 2 (no se acumulan)", () => {
    const state = freshState({ freezesUsed: 2, freezesTotal: 2, quarter: "2026-Q3" });
    const rolled = rolloverFreezesIfNeeded(state, "2026-10-01"); // Q4
    expect(rolled.freezesUsed).toBe(0);
    expect(rolled.freezesTotal).toBe(2);
    expect(rolled.quarter).toBe("2026-Q4");
  });

  it("los freezes no usados de un trimestre no pasan al siguiente", () => {
    // Si se acumularan, en enero (Q3->Q4->Q1) tendría 6-8 freezes.
    let state = freshState({ freezesUsed: 0, freezesTotal: 2, quarter: "2026-Q3" });
    state = rolloverFreezesIfNeeded(state, "2026-10-01"); // Q4, no usó ninguno en Q3
    state = rolloverFreezesIfNeeded(state, "2027-01-05"); // Q1 2027
    expect(state.freezesTotal).toBe(2);
    expect(state.freezesUsed).toBe(0);
  });
});
