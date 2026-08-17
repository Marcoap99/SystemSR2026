import { describe, expect, it } from "vitest";
import { capReached, countInMonth, exposureSummaryText, monthLabel } from "@/lib/domain/exposures";

describe("countInMonth", () => {
  it("solo cuenta eventos con output (criterio de aceptación #11)", () => {
    const events = [
      { date: "2026-08-05", counts: true },
      { date: "2026-08-12", counts: false }, // sin output, no cuenta
      { date: "2026-09-01", counts: true }, // otro mes
    ];
    expect(countInMonth(events, "2026-08-17")).toBe(1);
  });
});

describe("capReached", () => {
  it("sin cap definido nunca se alcanza", () => {
    expect(capReached(5, null)).toBe(false);
  });

  it("se alcanza al llegar (no solo al superar) el cap", () => {
    expect(capReached(2, 2)).toBe(true);
    expect(capReached(1, 2)).toBe(false);
  });
});

describe("exposureSummaryText — P9, nunca n/máximo", () => {
  it('genera "2 exposiciones en agosto", no "2/2"', () => {
    expect(exposureSummaryText(2, "2026-08-17")).toBe("2 exposiciones en agosto");
  });

  it("singular correcto para 1", () => {
    expect(exposureSummaryText(1, "2026-08-17")).toBe("1 exposición en agosto");
  });

  it("nunca contiene una barra tipo n/max", () => {
    const text = exposureSummaryText(2, "2026-08-17");
    expect(text).not.toMatch(/\d\s*\/\s*\d/);
  });
});

describe("monthLabel", () => {
  it("nombres de mes en español", () => {
    expect(monthLabel("2026-08-17")).toBe("agosto");
    expect(monthLabel("2026-12-01")).toBe("diciembre");
    expect(monthLabel("2027-01-15")).toBe("enero");
  });
});
