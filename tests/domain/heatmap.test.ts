import { describe, expect, it } from "vitest";
import { activeDaysCount, buildHeatmap, type ActivityEvent } from "@/lib/domain/heatmap";

describe("buildHeatmap", () => {
  it("incluye todos los días del rango, incluidos los que tienen 0 eventos", () => {
    const days = buildHeatmap([], "2026-08-01", "2026-08-03");
    expect(days.map((d) => d.date)).toEqual(["2026-08-01", "2026-08-02", "2026-08-03"]);
    expect(days.every((d) => d.count === 0 && d.level === 0)).toBe(true);
  });

  it("cuenta varios eventos del mismo día y guarda sus etiquetas", () => {
    const events: ActivityEvent[] = [
      { date: "2026-08-02", label: "Racha marcada" },
      { date: "2026-08-02", label: "Entrada de log" },
    ];
    const days = buildHeatmap(events, "2026-08-01", "2026-08-03");
    const day2 = days.find((d) => d.date === "2026-08-02")!;
    expect(day2.count).toBe(2);
    expect(day2.labels).toEqual(["Racha marcada", "Entrada de log"]);
  });

  it("ignora eventos fuera del rango", () => {
    const events: ActivityEvent[] = [
      { date: "2026-07-31", label: "fuera" },
      { date: "2026-08-04", label: "fuera" },
      { date: "2026-08-02", label: "dentro" },
    ];
    const days = buildHeatmap(events, "2026-08-01", "2026-08-03");
    expect(days.reduce((n, d) => n + d.count, 0)).toBe(1);
  });

  it("los niveles siguen los cortes 0/1/2/3-4/5+", () => {
    const mk = (n: number) => Array.from({ length: n }, (_, i) => ({ date: "2026-08-01", label: `e${i}` }));
    expect(buildHeatmap(mk(0), "2026-08-01", "2026-08-01")[0]!.level).toBe(0);
    expect(buildHeatmap(mk(1), "2026-08-01", "2026-08-01")[0]!.level).toBe(1);
    expect(buildHeatmap(mk(2), "2026-08-01", "2026-08-01")[0]!.level).toBe(2);
    expect(buildHeatmap(mk(4), "2026-08-01", "2026-08-01")[0]!.level).toBe(3);
    expect(buildHeatmap(mk(5), "2026-08-01", "2026-08-01")[0]!.level).toBe(4);
  });
});

describe("activeDaysCount", () => {
  it("cuenta solo los días con al menos un evento", () => {
    const days = buildHeatmap(
      [
        { date: "2026-08-01", label: "a" },
        { date: "2026-08-03", label: "b" },
      ],
      "2026-08-01",
      "2026-08-05",
    );
    expect(activeDaysCount(days)).toBe(2);
  });
});
