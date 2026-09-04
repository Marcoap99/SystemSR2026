import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/types";
import { today } from "@/lib/domain/dates";
import { logAppEvent } from "@/lib/server/events";
import { syncDuolingoStreak } from "@/lib/server/duolingo-sync";

const PUBLIC_PATHS = ["/login"];

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
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
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

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && path === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

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
