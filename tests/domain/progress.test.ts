import { describe, expect, it } from "vitest";
import { groupProgress, phaseProgress, progressVisualState } from "@/lib/domain/progress";

describe("groupProgress", () => {
  it("se deriva de los artefactos, nunca de un porcentaje guardado", () => {
    const artifacts = [
      { status: "done" },
      { status: "done" },
      { status: "pending" },
      { status: "pending" },
      { status: "pending" },
      { status: "pending" },
      { status: "in_progress" },
    ];
    // G1 en el seed: 2 done de 7 (criterio de aceptación #2)
    expect(groupProgress(artifacts)).toEqual({ done: 2, total: 7, ratio: 2 / 7 });
  });

  it("actualiza el ratio en cuanto un artefacto pasa a done", () => {
    const before = groupProgress([{ status: "pending" }, { status: "pending" }]);
    const after = groupProgress([{ status: "done" }, { status: "pending" }]);
    expect(before.ratio).toBe(0);
    expect(after.ratio).toBe(0.5);
  });

  it("grupo vacío no divide por cero", () => {
    expect(groupProgress([])).toEqual({ done: 0, total: 0, ratio: 0 });
  });
});

describe("progressVisualState", () => {
  it("0% es gris (empty), 1-99% es parcial, 100% es completo", () => {
    expect(progressVisualState(0)).toBe("empty");
    expect(progressVisualState(0.01)).toBe("partial");
    expect(progressVisualState(0.99)).toBe("partial");
    expect(progressVisualState(1)).toBe("complete");
  });
});

describe("phaseProgress", () => {
  it("semana 2 (arranque, primera semana del rango) da progreso 1/18", () => {
    expect(phaseProgress(2)).toBeCloseTo(1 / 18);
  });

  it("semana 19 (fin del rango de 18 semanas) da progreso 1", () => {
    expect(phaseProgress(19)).toBe(1);
  });

  it("se recorta a [0,1] fuera del rango útil", () => {
    expect(phaseProgress(1)).toBe(0);
    expect(phaseProgress(25)).toBe(1);
  });
});
