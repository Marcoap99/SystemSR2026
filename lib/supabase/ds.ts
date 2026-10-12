import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Las tablas `ds_*` (Daily System) aún no están en `Database` (lib/types.ts),
 * así que se usan con un cliente sin tipos. RLS por user_id las protege igual.
 */
export async function createDsClient(): Promise<SupabaseClient> {
  return (await createClient()) as unknown as SupabaseClient;
}
