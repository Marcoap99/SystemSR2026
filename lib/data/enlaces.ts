import { createClient } from "@/lib/supabase/server";
import type { Resource } from "@/lib/types";

export interface EnlacesData {
  resources: Resource[];
}

/**
 * V1.4 parche sección 2 — /enlaces: biblioteca permanente de links
 * fuera del plan. learn_code IS NULL es la única señal de "libre" --
 * no se agregó columna aparte. Se queda para siempre acá, tenga nota o
 * no (a diferencia de /notas, que solo muestra lo que ya tiene nota).
 */
export async function getEnlacesData(): Promise<EnlacesData> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("resources")
    .select("*")
    .is("learn_code", null)
    .order("created_at", { ascending: false });

  return { resources: (data ?? []) as Resource[] };
}
