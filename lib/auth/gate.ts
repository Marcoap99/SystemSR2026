export const PUBLIC_PATHS = ["/login", "/auth/callback"];

export type GateAction =
  | "continue"
  | "to-login"
  | "to-home"
  /** Correo no autorizado en una ruta protegida: cerrar sesión y redirigir a /login?error=denied. */
  | "denied-redirect"
  /** Correo no autorizado ya en /login: cerrar sesión y mostrar el aviso (sin redirigir: evita el lazo). */
  | "denied-continue"
  /** Correo no autorizado llegando al callback de OAuth: dejar pasar, el callback decide (no tocar el verificador PKCE). */
  | "callback-continue";

/** Decisión de acceso del middleware, pura para poder probarla. */
export function authGate(opts: { hasUser: boolean; allowed: boolean; path: string }): GateAction {
  const { hasUser, allowed, path } = opts;
  const isPublic = PUBLIC_PATHS.some((p) => path.startsWith(p));
  if (!hasUser) return isPublic ? "continue" : "to-login";
  if (!allowed) {
    if (path.startsWith("/auth/callback")) return "callback-continue";
    return path === "/login" ? "denied-continue" : "denied-redirect";
  }
  return path === "/login" ? "to-home" : "continue";
}
