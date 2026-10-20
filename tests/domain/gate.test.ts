import { describe, expect, it } from "vitest";
import { authGate } from "@/lib/auth/gate";

describe("authGate", () => {
  it("sin sesión: rutas protegidas van a /login, las públicas pasan", () => {
    expect(authGate({ hasUser: false, allowed: false, path: "/nucleo" })).toBe("to-login");
    expect(authGate({ hasUser: false, allowed: false, path: "/login" })).toBe("continue");
    expect(authGate({ hasUser: false, allowed: false, path: "/auth/callback" })).toBe("continue");
  });
  it("con sesión autorizada: /login manda al inicio, el resto pasa", () => {
    expect(authGate({ hasUser: true, allowed: true, path: "/login" })).toBe("to-home");
    expect(authGate({ hasUser: true, allowed: true, path: "/nucleo" })).toBe("continue");
  });
  it("correo no autorizado nunca produce lazo: /login se muestra, el callback decide, lo demás redirige", () => {
    expect(authGate({ hasUser: true, allowed: false, path: "/login" })).toBe("denied-continue");
    expect(authGate({ hasUser: true, allowed: false, path: "/auth/callback" })).toBe("callback-continue");
    expect(authGate({ hasUser: true, allowed: false, path: "/nucleo" })).toBe("denied-redirect");
    expect(authGate({ hasUser: true, allowed: false, path: "/" })).toBe("denied-redirect");
  });
});
