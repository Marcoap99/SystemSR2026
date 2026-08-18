import { createClient } from "@/lib/supabase/server";
import { monthsAgo, today } from "@/lib/domain/dates";
import { activeDaysCount, buildHeatmap, type ActivityEvent, type HeatmapDay } from "@/lib/domain/heatmap";

export interface HeatmapData {
  days: HeatmapDay[];
  activeDays: number;
  fromISO: string;
  toISO: string;
}

const APP_EVENT_LABEL: Record<string, string> = {
  streak_marked: "Racha marcada",
  artifact_done: "Artefacto cerrado",
  resource_done: "Recurso completado",
  connection_done: "Conexión hecha",
};

/**
 * V1.1 C.4: junta los 6 tipos de evento que cuentan como actividad
 * (racha marcada, artefacto cerrado, recurso completado, entrada de log,
 * conexión hecha, exposición registrada) de los últimos 6 meses y arma la
 * grilla día a día. Los cuatro primeros salen de app_events (ya logueados
 * en sus respectivas acciones); log y exposición usan su propia fecha de
 * evidencia, no la de creación de la fila.
 */
export async function getHeatmapData(): Promise<HeatmapData> {
  const supabase = await createClient();
  const todayISO = today();
  const fromISO = monthsAgo(todayISO, 6);

  const [{ data: appEvents }, { data: logEntries }, { data: exposureEvents }] = await Promise.all([
    supabase
      .from("app_events")
      .select("event_type, created_at")
      .in("event_type", Object.keys(APP_EVENT_LABEL))
      .gte("created_at", `${fromISO}T00:00:00Z`),
    supabase.from("log_entries").select("date").gte("date", fromISO),
    supabase.from("exposure_events").select("date").gte("date", fromISO),
  ]);

  const events: ActivityEvent[] = [];
  for (const e of appEvents ?? []) {
    events.push({ date: today(new Date(e.created_at)), label: APP_EVENT_LABEL[e.event_type] ?? e.event_type });
  }
  for (const l of logEntries ?? []) {
    events.push({ date: l.date, label: "Entrada de log" });
  }
  for (const x of exposureEvents ?? []) {
    events.push({ date: x.date, label: "Exposición registrada" });
  }

  const days = buildHeatmap(events, fromISO, todayISO);
  return { days, activeDays: activeDaysCount(days), fromISO, toISO: todayISO };
}
