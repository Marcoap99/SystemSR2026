import { describe, expect, it } from "vitest";
import { isPhaseLocked, lockTooltip } from "@/lib/domain/phases";

const PHASES = [
  { number: 1, unlocked: true, unlocked_by_boss: null },
  { number: 2, unlocked: false, unlocked_by_boss: 1 },
  { number: 3, unlocked: false, unlocked_by_boss: 2 },
];

const BOSSES = [
  { number: 1, date: "2026-11-10" },
  { number: 2, date: "2026-12-18" },
];

describe("isPhaseLocked", () => {
  it("fase 1 desbloqueada, fases 2 y 3 bloqueadas (estado inicial del seed)", () => {
    expect(isPhaseLocked(1, PHASES)).toBe(false);
    expect(isPhaseLocked(2, PHASES)).toBe(true);
    expect(isPhaseLocked(3, PHASES)).toBe(true);
  });
});

describe("lockTooltip — criterio de aceptación #8", () => {
  it('fase 2 bloqueada: "Se abre con Boss 1 — 10 nov"', () => {
    expect(lockTooltip(2, PHASES, BOSSES)).toBe("Se abre con Boss 1 — 10 nov");
  });

  it("fase 1 desbloqueada: sin tooltip", () => {
    expect(lockTooltip(1, PHASES, BOSSES)).toBeNull();
  });

  it("fase 3 bloqueada, referencia al Boss 2", () => {
    expect(lockTooltip(3, PHASES, BOSSES)).toBe("Se abre con Boss 2 — 18 dic");
  });
});
