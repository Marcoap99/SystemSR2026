import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/types";

/**
 * Cliente de Supabase para Server Components, Server Actions y Route
 * Handlers. Lee/escribe la sesión vía cookies de Next.js.
 *
 * En un Server Component puro la escritura de cookies puede fallar (Next
 * no lo permite fuera de Server Actions/Route Handlers); el catch es
 * intencional: el middleware ya se encarga de refrescar la sesión.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Llamado desde un Server Component — el middleware refresca la sesión.
          }
        },
      },
    },
  );
}
