import { describe, expect, it } from "vitest";
import { dependencyTooltip, isDependencyBlocked, type DoneLookup } from "@/lib/domain/dependencies";

describe("isDependencyBlocked", () => {
  it("sin blocked_by, nunca está bloqueado", () => {
    expect(isDependencyBlocked(null, {})).toBe(false);
  });

  it("bloqueado mientras el código del que depende no esté done", () => {
    const doneByCode: DoneLookup = { "AR7.1": false };
    expect(isDependencyBlocked("AR7.1", doneByCode)).toBe(true);
  });

  it("bloqueado si el código del que depende ni siquiera aparece en el mapa", () => {
    expect(isDependencyBlocked("AR7.1", {})).toBe(true);
  });

  it("desbloqueado una vez que el código del que depende está done", () => {
    const doneByCode: DoneLookup = { "AR7.1": true };
    expect(isDependencyBlocked("AR7.1", doneByCode)).toBe(false);
  });
});

describe("dependencyTooltip", () => {
  it("null cuando no está bloqueado", () => {
    expect(dependencyTooltip(null, {})).toBeNull();
    expect(dependencyTooltip("AR7.1", { "AR7.1": true })).toBeNull();
  });

  it('el texto exacto "Se habilita al cerrar {código}" (criterio de aceptación #2)', () => {
    expect(dependencyTooltip("AR7.1", {})).toBe("Se habilita al cerrar AR7.1");
    expect(dependencyTooltip("G10.1", { "AR7.1": true })).toBe("Se habilita al cerrar G10.1");
  });
});
