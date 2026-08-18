import { describe, expect, it } from "vitest";
import { addDays, diffDays, diffWeeks, isFriday, mondayOf, quarterOf, today } from "@/lib/domain/dates";

describe("today()", () => {
  it("usa America/Lima (UTC-5), no la zona del servidor", () => {
    // 2026-08-17T02:30:00Z (2:30am UTC) es todavía 2026-08-16, 9:30pm en Lima.
    expect(today(new Date("2026-08-17T02:30:00Z"))).toBe("2026-08-16");
    // 2026-08-17T06:00:00Z (6:00am UTC) ya es 2026-08-17, 1:00am en Lima.
    expect(today(new Date("2026-08-17T06:00:00Z"))).toBe("2026-08-17");
  });
});

describe("diffDays / addDays", () => {
  it("cuenta días calendario simples", () => {
    expect(diffDays("2026-08-17", "2026-08-18")).toBe(1);
    expect(diffDays("2026-08-17", "2026-08-20")).toBe(3);
    expect(diffDays("2026-08-17", "2026-08-17")).toBe(0);
  });

  it("faltan 85 días de hoy (17-ago) al Boss 1 (10-nov), como dice el PRD", () => {
    expect(diffDays("2026-08-17", "2026-11-10")).toBe(85);
  });

  it("addDays es el inverso de diffDays", () => {
    expect(addDays("2026-08-17", 85)).toBe("2026-11-10");
  });
});

describe("mondayOf / diffWeeks", () => {
  it("devuelve el lunes de la semana que contiene la fecha", () => {
    expect(mondayOf("2026-08-19")).toBe("2026-08-17"); // miércoles -> lunes de esa semana
    expect(mondayOf("2026-08-17")).toBe("2026-08-17"); // ya es lunes
    expect(mondayOf("2026-08-23")).toBe("2026-08-17"); // domingo -> lunes de esa semana
  });

  it("cuenta semanas completas entre dos fechas", () => {
    expect(diffWeeks("2026-08-19", "2026-08-21")).toBe(0); // misma semana
    expect(diffWeeks("2026-08-19", "2026-08-26")).toBe(1); // semana siguiente
    expect(diffWeeks("2026-08-19", "2026-09-02")).toBe(2);
  });
});

describe("isFriday", () => {
  it("identifica el viernes de la semana (C.2)", () => {
    expect(isFriday("2026-08-17")).toBe(false); // lunes
    expect(isFriday("2026-08-21")).toBe(true); // viernes
    expect(isFriday("2026-08-22")).toBe(false); // sábado
  });
});

describe("quarterOf", () => {
  it("mapea meses a trimestre calendario", () => {
    expect(quarterOf("2026-08-17")).toBe("2026-Q3");
    expect(quarterOf("2026-10-01")).toBe("2026-Q4");
    expect(quarterOf("2027-01-05")).toBe("2027-Q1");
    expect(quarterOf("2026-01-01")).toBe("2026-Q1");
  });
});
