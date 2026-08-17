import { describe, expect, it } from "vitest";
import { currentWeek, isFiestas } from "@/lib/domain/weeks";

const WEEKS = [
  { number: 2, start_date: "2026-08-17", end_date: "2026-08-23" },
  { number: 3, start_date: "2026-08-24", end_date: "2026-08-30" },
  { number: 20, start_date: "2026-12-21", end_date: "2026-12-27" },
  { number: 25, start_date: "2027-01-25", end_date: "2027-01-31" },
];

describe("currentWeek", () => {
  it("encuentra la semana que contiene hoy (criterio de aceptación #2: semana 2 activa)", () => {
    expect(currentWeek(WEEKS, "2026-08-17")?.number).toBe(2);
    expect(currentWeek(WEEKS, "2026-08-20")?.number).toBe(2);
    expect(currentWeek(WEEKS, "2026-08-24")?.number).toBe(3);
  });

  it("antes del inicio del plan degrada a la primera semana", () => {
    expect(currentWeek(WEEKS, "2026-01-01")?.number).toBe(2);
  });

  it("después del final del plan degrada a la última semana, sin crashear", () => {
    expect(currentWeek(WEEKS, "2027-06-01")?.number).toBe(25);
  });

  it("lista vacía no crashea", () => {
    expect(currentWeek([], "2026-08-17")).toBeNull();
  });
});

describe("isFiestas", () => {
  it("semanas 20/21 son fiestas: sin quests, pero se siguen mostrando", () => {
    expect(isFiestas({ load: "fiestas" })).toBe(true);
    expect(isFiestas({ load: "alta" })).toBe(false);
  });
});
