import { describe, expect, it } from "vitest";
import { compileExpedienteMarkdown } from "@/lib/domain/expediente";

describe("compileExpedienteMarkdown — criterio de aceptación #12", () => {
  it("agrupa por mes y ordena cronológicamente", () => {
    const md = compileExpedienteMarkdown([
      { date: "2026-09-02", what: "Cosa de septiembre", evidence: "Ev2", ref_code: null },
      { date: "2026-08-17", what: "Cosa de agosto", evidence: "Ev1", ref_code: "CN1" },
      { date: "2026-08-20", what: "Otra de agosto", evidence: "Ev3", ref_code: null },
    ]);

    const augustIndex = md.indexOf("## Agosto 2026");
    const septemberIndex = md.indexOf("## Septiembre 2026");

    expect(augustIndex).toBeGreaterThanOrEqual(0);
    expect(septemberIndex).toBeGreaterThan(augustIndex);
    expect(md.indexOf("2026-08-17")).toBeLessThan(md.indexOf("2026-08-20"));
    expect(md).toContain("Ref: CN1");
  });

  it("una entrada sin ref_code no imprime la línea 'Ref:'", () => {
    const md = compileExpedienteMarkdown([
      { date: "2026-08-17", what: "Algo", evidence: "Prueba", ref_code: null },
    ]);
    expect(md).not.toContain("Ref:");
  });

  it("sin entradas, produce un documento válido en vez de romperse", () => {
    const md = compileExpedienteMarkdown([]);
    expect(md).toContain("Sin entradas todavía");
  });
});
