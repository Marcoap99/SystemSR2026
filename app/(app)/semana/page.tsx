import { getSemanaData } from "@/lib/data/semana";
import { LANE_COLOR, LANE_NAME } from "@/lib/domain/ds";

export const dynamic = "force-dynamic";

/** Bloque 5 realineación — Semana: agenda de los próximos 14 días desde Google Calendar. */
export default async function SemanaPage() {
  const data = await getSemanaData();

  const byDay = new Map<string, typeof data.events>();
  for (const e of data.events) {
    const list = byDay.get(e.dateISO) ?? [];
    list.push(e);
    byDay.set(e.dateISO, list);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-text">Semana</h1>
        <p className="mt-1 text-sm text-text-muted">Próximos 14 días, coloreado por carril (A/B/C).</p>
      </div>

      {!data.configured ? (
        <div className="hud-panel p-4">
          <p className="text-sm text-text-muted">
            Todavía no está conectado tu Google Calendar. Cuando configures <code className="font-mono">ICAL_URL</code>{" "}
            (ver docs/ULTIMO_PASO.md) tus eventos van a aparecer acá, coloreados por carril si el título empieza con
            &quot;A |&quot;, &quot;B |&quot; o &quot;C |&quot;.
          </p>
        </div>
      ) : data.error ? (
        <div className="hud-panel p-4">
          <p className="text-sm text-warn">⚠ {data.error}</p>
        </div>
      ) : data.events.length === 0 ? (
        <div className="hud-panel p-4">
          <p className="text-sm text-text-muted">Sin eventos en los próximos 14 días.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {[...byDay.entries()].map(([day, events]) => (
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
    </div>
  );
}
