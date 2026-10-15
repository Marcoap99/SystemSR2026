import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/types";
import { today } from "@/lib/domain/dates";
import { logAppEvent } from "@/lib/server/events";
import { syncDuolingoStreak } from "@/lib/server/duolingo-sync";
import { isAllowedEmail } from "@/lib/auth/allowed";
import { authGate, PUBLIC_PATHS } from "@/lib/auth/gate";

/**
 * `app_open`/`section_view` viven acá, no dispersos en cada data loader,
 * a propósito: el middleware es el único punto que puede distinguir una
 * navegación GET real de un Server Action (POST) o de un revalidatePath
 * disparado por una mutación — si esto viviera en getDashboardData(),
 * cada "Marcar hoy" volvería a contar como una apertura de app.
 */
function sectionNameFor(pathname: string): string | null {
  if (pathname === "/aprender") return "aprender";
  if (pathname === "/conectar") return "conectar";
  if (pathname === "/exponer") return "exponer";
  if (pathname === "/log") return "log";
  if (pathname.startsWith("/g/")) return `grupo:${pathname.slice(3)}`;
  return null;
}

/**
 * Refresca la sesión de Supabase en cada request y protege las rutas de
 * la app: sin sesión no se ve nada (criterio de aceptación #1).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers?: Record<string, string>) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
          // Versiones nuevas de @supabase/ssr pasan cabeceras anti-caché junto a las cookies.
          if (headers) for (const [k, v] of Object.entries(headers)) response.headers.set(k, v);
        },
      },
    },
  );

  // No usar getSession(): getUser() revalida el token contra Supabase Auth
  // en vez de confiar en la cookie tal cual.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublicPath = PUBLIC_PATHS.some((p) => path.startsWith(p));

  // Toda redirección conserva las cookies (y cabeceras anti-caché) que getUser()
  // o signOut() acaban de escribir en `response`: si se pierden, el refresh token
  // rotado no llega al navegador y la sesión se cae en el siguiente request.
  const redirectTo = (pathname: string, search = "") => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = search;
    const redirect = NextResponse.redirect(url);
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    for (const h of ["cache-control", "expires", "pragma"]) {
      const v = response.headers.get(h);
      if (v) redirect.headers.set(h, v);
    }
    return redirect;
  };

  const gate = authGate({ hasUser: !!user, allowed: isAllowedEmail(user?.email), path });
  if (gate === "to-login") return redirectTo("/login");
  if (gate === "to-home") return redirectTo("/");
  if (gate === "denied-redirect") {
    await supabase.auth.signOut({ scope: "local" });
    return redirectTo("/login", "?error=denied");
  }
  if (gate === "denied-continue") {
    await supabase.auth.signOut({ scope: "local" });
    return response;
  }
  // "callback-continue": el route handler de /auth/callback decide y cierra sesión.

  if (user && !isPublicPath) {
    const isPrefetch =
      request.headers.get("next-router-prefetch") === "1" ||
      request.headers.get("purpose") === "prefetch";

    if (request.method === "GET" && !isPrefetch) {
      if (path === "/") {
        await logAppEvent(supabase, "app_open");
        // V1.7: mismo gate que app_open -- una apertura real de la app,
        // no cada revalidate. syncDuolingoStreak ya es best-effort adentro.
        await syncDuolingoStreak(supabase, today());
      } else {
        const section = sectionNameFor(path);
        if (section) await logAppEvent(supabase, "section_view", { section });
      }
    }
  }

  return response;
}
