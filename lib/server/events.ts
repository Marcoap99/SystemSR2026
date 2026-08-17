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
  | "result_achieved";

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
