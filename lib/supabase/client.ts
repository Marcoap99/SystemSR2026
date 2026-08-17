import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types";

/**
 * Cliente de Supabase para Client Components. Usa las cookies del
 * navegador para la sesión — no reintenta ni cachea nada por su cuenta.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
