/**
 * Instrumentación (PRD 5 / propósito: medir uso real para la retro de
 * diciembre, G6.3). Best-effort: un fallo acá nunca debe romper el flujo
 * principal, solo se loguea.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

export type AppEventType =
  | "app_open"
  | "section_view"
  | "log_created"
  | "streak_marked"
  | "freeze_used"
  | "artifact_done"
  | "result_achieved"
  // V1.1 C.4: el heatmap de actividad necesita saber cuándo se completó un
  // recurso o se cerró una conexión, y ninguna de las dos tablas tiene su
  // propio timestamp de "cuándo cambió a done" — así que se loguea acá,
  // igual que ya se hacía con artifact_done.
  | "resource_done"
  | "connection_done";

export async function logAppEvent(
  supabase: SupabaseClient<Database>,
  eventType: AppEventType,
  payload: Record<string, unknown> = {},
): Promise<void> {
  const { error } = await supabase.from("app_events").insert({ event_type: eventType, payload });
  if (error) {
    console.error(`[app_events] no se pudo registrar "${eventType}":`, error.message);
  }
}
