import { getSemanaData } from "@/lib/data/semana";
import { getWeekData } from "@/lib/data/ds-week";
import { LANE_COLOR, LANE_NAME, type Lane } from "@/lib/domain/ds";
import { AddEventForm } from "@/components/semana/AddEventForm";
import { APP_TIMEZONE } from "@/lib/domain/dates";

export const dynamic = "force-dynamic";

const LANES: Lane[] = ["A", "B", "C", "D"];

function dateTimeInLima(iso: string): { dateISO: string; time: string } {
  const d = new Date(iso);
  const dateISO = new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  const time = new Intl.DateTimeFormat("es-PE", { timeZone: APP_TIMEZONE, hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
  return { dateISO, time };
}

/** Realineación 21/10 — Semana: Google Calendar real (lectura + escritura) + cumplimiento planeado vs real por carril. */
export default async function SemanaPage({ searchParams }: { searchParams: Promise<{ calendar?: string }> }) {
  const { calendar } = await searchParams;
  const [data, week] = await Promise.all([getSemanaData(), getWeekData()]);

  const byDay = new Map<string, { id: string; title: string; lane: Lane | null; time: string }[]>();
  for (const e of data.events) {
    const { dateISO, time } = dateTimeInLima(e.startISO);
    const list = byDay.get(dateISO) ?? [];
    list.push({ id: e.id, title: e.title, lane: e.lane, time });
    byDay.set(dateISO, list);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-text">Semana</h1>
        <p className="mt-1 text-sm text-text-muted">Tu Google Calendar real, coloreado por carril (A/B/C/D).</p>
      </div>

      {calendar === "connected" ? (
        <p role="status" className="rounded-card border border-brand/30 bg-brand/10 px-4 py-2 text-sm text-text">
          Google Calendar conectado.
        </p>
      ) : calendar === "error" ? (
        <p role="alert" className="rounded-card border border-warn/40 bg-warn/10 px-4 py-2 text-sm text-warn">
          No se pudo conectar con Google Calendar. Probá de nuevo.
        </p>
      ) : null}

      {!data.connected ? (
        <div className="hud-panel flex flex-col gap-2 p-4">
          <p className="text-sm text-text-muted">
            Todavía no conectaste tu Google Calendar. Una vez conectado vas a ver tus eventos acá, coloreados por carril
            si el título empieza con &quot;A |&quot;, &quot;B |&quot;, &quot;C |&quot; o &quot;D |&quot;, y vas a poder crear
            eventos desde la app que aparecen en tu calendario real.
          </p>
          <a
            href="/api/calendar/connect"
            className="inline-block w-fit rounded-card bg-brand px-4 py-2 text-sm font-semibold text-bg hover:bg-brand-dark"
          >
            Conectar Google Calendar
          </a>
        </div>
      ) : data.error ? (
        <div className="hud-panel p-4">
          <p className="text-sm text-warn">⚠ {data.error}</p>
        </div>
      ) : (
        <>
          <section className="hud-panel p-4">
            <h2 className="hud-label">Cumplimiento de la semana (planeado en el calendario vs real)</h2>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {LANES.map((l) => {
                const planned = data.plannedHoursWeek[l];
                const real = week.hours[l];
                const pct = planned > 0 ? Math.round((real / planned) * 100) : real > 0 ? 100 : 0;
                return (
                  <div key={l} className="flex flex-col gap-1">
                    <p className="font-mono text-xs text-text-muted">
                      {l} · {LANE_NAME[l]}
                    </p>
                    <p className="font-mono text-sm text-text">
                      {real} / {planned} h <span className="text-text-muted">({pct}%)</span>
                    </p>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, background: LANE_COLOR[l] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <AddEventForm />

          {byDay.size === 0 ? (
            <div className="hud-panel p-4">
              <p className="text-sm text-text-muted">Sin eventos esta semana ni en los próximos 14 días.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {[...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([day, events]) => (
                <section key={day} className="hud-panel p-4">
                  <h2 className="hud-label">{day}</h2>
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {events.map((e) => (
                      <li key={e.id} className="flex items-center gap-2 text-sm">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ background: e.lane ? LANE_COLOR[e.lane] : "var(--color-border)" }}
                        />
                        <span className="font-mono text-xs text-text-muted">{e.time}</span>
                        <span className="text-text">{e.title}</span>
                        {e.lane ? <span className="font-mono text-xs text-text-muted">· {LANE_NAME[e.lane]}</span> : null}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
