import { describe, expect, it } from "vitest";
import { daysUntil, nextPendingBoss, shouldShowCountdown } from "@/lib/domain/countdown";

const BOSSES = [
  { number: 1, date: "2026-11-10", status: "pending" },
  { number: 2, date: "2026-12-18", status: "pending" },
  { number: 3, date: "2027-01-20", status: "pending" },
];

describe("nextPendingBoss", () => {
  it("toma el primer boss pendiente por fecha", () => {
    expect(nextPendingBoss(BOSSES)?.number).toBe(1);
  });

  it("salta los que ya no están pending", () => {
    const bosses = [{ ...BOSSES[0]!, status: "won" }, BOSSES[1]!, BOSSES[2]!];
    expect(nextPendingBoss(bosses)?.number).toBe(2);
  });

  it("null si no hay ninguno pendiente", () => {
    const bosses = BOSSES.map((b) => ({ ...b, status: "won" }));
    expect(nextPendingBoss(bosses)).toBeNull();
  });
});

describe("shouldShowCountdown — criterio de aceptación #9 (P4/6.7)", () => {
  it('17 de agosto: el contador NO aparece (faltan 85 días para el Boss 1)', () => {
    expect(shouldShowCountdown("2026-11-10", "2026-08-17")).toBe(false);
  });

  it("25 de octubre: el contador SÍ aparece (faltan 16 días, <=21)", () => {
    expect(shouldShowCountdown("2026-11-10", "2026-10-25")).toBe(true);
  });

  it("exactamente 21 días también se muestra (<=21, límite inclusive)", () => {
    expect(daysUntil("2026-11-10", "2026-10-20")).toBe(21);
    expect(shouldShowCountdown("2026-11-10", "2026-10-20")).toBe(true);
  });

  it("22 días todavía no se muestra", () => {
    expect(shouldShowCountdown("2026-11-10", "2026-10-19")).toBe(false);
  });
});
