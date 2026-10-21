import { createClient } from "@/lib/supabase/server";
import { addDays, mondayOf, today } from "@/lib/domain/dates";
import { getValidAccessToken, listEvents, type CalendarEvent } from "@/lib/server/google-calendar";
import type { Lane } from "@/lib/domain/ds";

export interface SemanaData {
  connected: boolean;
  events: CalendarEvent[];
  /** Suma de horas por carril, calculada de la duración de los eventos de esta semana (lunes-domingo del rango pedido). */
  plannedHoursWeek: Record<Lane, number>;
  error: string | null;
}

const zero = (): Record<Lane, number> => ({ A: 0, B: 0, C: 0, D: 0 });

/**
 * Realineación 21/10 — Semana ya no lee ICAL_URL (solo lectura): lee
 * Google Calendar de verdad vía la conexión OAuth (lectura + escritura,
 * ver lib/server/google-calendar.ts). Si Marco todavía no conectó,
 * `connected: false` -- la página muestra el botón de conectar, no se
 * rompe.
 */
export async function getSemanaData(): Promise<SemanaData> {
  const supabase = await createClient();
  const accessToken = await getValidAccessToken(supabase).catch(() => null);
  if (!accessToken) return { connected: false, events: [], plannedHoursWeek: zero(), error: null };

  const monday = mondayOf(today());
  const windowEnd = addDays(today(), 13);

  try {
    const events = await listEvents(accessToken, `${monday}T00:00:00Z`, `${windowEnd}T23:59:59Z`);
    const friday = addDays(monday, 4);
    const plannedHoursWeek = zero();
    for (const e of events) {
      if (!e.lane) continue;
      const dateISO = e.startISO.slice(0, 10);
      if (dateISO < monday || dateISO > friday) continue;
      const hours = (new Date(e.endISO).getTime() - new Date(e.startISO).getTime()) / 3_600_000;
      plannedHoursWeek[e.lane] += Math.max(0, hours);
    }
    for (const lane of Object.keys(plannedHoursWeek) as Lane[]) {
      plannedHoursWeek[lane] = Math.round(plannedHoursWeek[lane] * 10) / 10;
    }
    return { connected: true, events, plannedHoursWeek, error: null };
  } catch (err) {
    return {
      connected: true,
      events: [],
      plannedHoursWeek: zero(),
      error: err instanceof Error ? err.message : "Error al leer el calendario.",
    };
  }
}
