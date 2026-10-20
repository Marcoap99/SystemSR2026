import ICAL from "ical.js";
import { addDays, APP_TIMEZONE, today } from "@/lib/domain/dates";
import { LANE_COLOR, LANE_NAME, type Lane } from "@/lib/domain/ds";

export interface SemanaEvent {
  id: string;
  title: string;
  lane: Lane | null;
  dateISO: string;
  time: string;
}

export interface SemanaData {
  configured: boolean;
  events: SemanaEvent[];
  error: string | null;
}

const LANE_PREFIXES: { prefix: string; lane: Lane }[] = [
  { prefix: "A |", lane: "A" },
  { prefix: "B |", lane: "B" },
  { prefix: "C |", lane: "C" },
];

function splitLane(summary: string): { lane: Lane | null; title: string } {
  for (const { prefix, lane } of LANE_PREFIXES) {
    if (summary.startsWith(prefix)) return { lane, title: summary.slice(prefix.length).trim() };
  }
  return { lane: null, title: summary };
}

function toDateISO(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

function toTimeLabel(d: Date): string {
  return new Intl.DateTimeFormat("es-PE", { timeZone: APP_TIMEZONE, hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
}

/**
 * Bloque 5 realineación — Semana: lee process.env.ICAL_URL (Google
 * Calendar) y lo pinta coloreado por carril A/B/C según el prefijo del
 * título. Si Marco todavía no configuró ICAL_URL (docs/ULTIMO_PASO.md),
 * `configured: false` -- la página muestra un aviso neutro, no se rompe.
 */
export async function getSemanaData(): Promise<SemanaData> {
  const url = process.env.ICAL_URL;
  if (!url) return { configured: false, events: [], error: null };

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return { configured: true, events: [], error: `No se pudo leer el calendario (HTTP ${res.status}).` };
    const text = await res.text();

    const comp = new ICAL.Component(ICAL.parse(text));
    const vevents = comp.getAllSubcomponents("vevent");

    const windowStart = today();
    const windowEnd = addDays(windowStart, 13);

    const events: SemanaEvent[] = [];
    let n = 0;
    for (const vevent of vevents) {
      const event = new ICAL.Event(vevent);
      const { lane, title } = splitLane(event.summary ?? "(sin título)");

      if (event.isRecurring()) {
        const iterator = event.iterator();
        let occurrence: ReturnType<typeof iterator.next>;
        let guard = 0;
        while ((occurrence = iterator.next()) && guard < 300) {
          guard++;
          const details = event.getOccurrenceDetails(occurrence);
          const dateISO = toDateISO(details.startDate.toJSDate());
          if (dateISO > windowEnd) break;
          if (dateISO < windowStart) continue;
          events.push({ id: `occ-${n++}`, title, lane, dateISO, time: toTimeLabel(details.startDate.toJSDate()) });
        }
      } else {
        const dateISO = toDateISO(event.startDate.toJSDate());
        if (dateISO >= windowStart && dateISO <= windowEnd) {
          events.push({ id: `occ-${n++}`, title, lane, dateISO, time: toTimeLabel(event.startDate.toJSDate()) });
        }
      }
    }

    events.sort((a, b) => (a.dateISO + a.time).localeCompare(b.dateISO + b.time));
    return { configured: true, events, error: null };
  } catch (err) {
    return { configured: true, events: [], error: err instanceof Error ? err.message : "Error al leer el calendario." };
  }
}

export { LANE_COLOR, LANE_NAME };
