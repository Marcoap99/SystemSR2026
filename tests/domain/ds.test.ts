import { describe, expect, it } from "vitest";
import {
  currentDsWeek,
  dayResults,
  daysToStart,
  greetingFor,
  laneProgress,
  mondayOf,
  parseCommand,
  type DsTask,
} from "@/lib/domain/ds";

const weeks = [
  { number: 1, starts_on: "2026-10-19", ends_on: "2026-10-25" },
  { number: 2, starts_on: "2026-10-26", ends_on: "2026-11-01" },
];

describe("semana de la temporada", () => {
  it("encuentra la semana actual y devuelve null fuera de rango", () => {
    expect(currentDsWeek("2026-10-27", weeks)?.number).toBe(2);
    expect(currentDsWeek("2026-10-12", weeks)).toBeNull();
  });
  it("cuenta días al arranque solo antes de empezar", () => {
    expect(daysToStart("2026-10-12", weeks)).toBe(7);
    expect(daysToStart("2026-10-20", weeks)).toBeNull();
  });
  it("lunes de la semana", () => {
    expect(mondayOf("2026-10-14")).toBe("2026-10-12");
    expect(mondayOf("2026-10-18")).toBe("2026-10-12"); // domingo
  });
});

describe("anillos y saludo", () => {
  it("progreso con tope en 1 y sin negativos", () => {
    expect(laneProgress("A", 4)).toBe(0.5);
    expect(laneProgress("B", 99)).toBe(1);
    expect(laneProgress("C", -1)).toBe(0);
  });
  it("saludo por hora", () => {
    expect(greetingFor(9)).toBe("Buenos días");
    expect(greetingFor(15)).toBe("Buenas tardes");
    expect(greetingFor(21)).toBe("Buenas noches");
  });
});

describe("resultados del día", () => {
  const t = (id: string, rank: number | null): DsTask => ({ id, lane: "A", title: id, status: "pending", result_rank: rank });
  it("numera 01..03 por orden y corta en 3", () => {
    const r = dayResults([t("d", 4), t("b", 2), t("a", 1), t("c", 3)]);
    expect(r.map((x) => `${x.n}:${x.task.id}`)).toEqual(["01:a", "02:b", "03:c"]);
  });
});

describe("comandos", () => {
  it("reconoce los comandos V1", () => {
    expect(parseCommand("¿Qué tengo hoy?")).toEqual({ kind: "today" });
    expect(parseCommand("Marca el 01")).toEqual({ kind: "mark", n: 1 });
    expect(parseCommand("marca el 2")).toEqual({ kind: "mark", n: 2 });
    expect(parseCommand("abre Aprender")).toEqual({ kind: "open", target: "aprender" });
    expect(parseCommand("volver al núcleo")).toEqual({ kind: "open", target: "nucleo" });
    expect(parseCommand("día mínimo viable")).toEqual({ kind: "minimum" });
    expect(parseCommand("cuántas horas llevo")).toEqual({ kind: "hours" });
    expect(parseCommand("bailar")).toEqual({ kind: "unknown" });
  });
});

import { previousWorkday, zeroDayAlert } from "@/lib/domain/ds";

describe("regla de no dos días en cero", () => {
  it("el día laborable anterior salta el fin de semana", () => {
    expect(previousWorkday("2026-10-19")).toBe("2026-10-16"); // lunes -> viernes
    expect(previousWorkday("2026-10-21")).toBe("2026-10-20");
  });
  it("avisa solo con ayer y hoy en cero, en temporada y día laborable", () => {
    const start = "2026-10-19";
    expect(zeroDayAlert("2026-10-21", start, new Set())).toBe(true);
    expect(zeroDayAlert("2026-10-21", start, new Set(["2026-10-20"]))).toBe(false);
    expect(zeroDayAlert("2026-10-21", start, new Set(["2026-10-21"]))).toBe(false);
    expect(zeroDayAlert("2026-10-18", start, new Set())).toBe(false); // antes de empezar
    expect(zeroDayAlert("2026-10-24", start, new Set())).toBe(false); // sábado
  });
});
