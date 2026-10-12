import { getNucleoData } from "@/lib/data/ds-nucleo";
import { greetingFor } from "@/lib/domain/ds";
import { Orb } from "@/components/nucleo/Orb";
import { Results } from "@/components/nucleo/Results";
import { HoursButtons } from "@/components/nucleo/HoursButtons";
import { CommandBar } from "@/components/nucleo/CommandBar";

export const dynamic = "force-dynamic";

function Panel({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`relative flex min-h-0 flex-col gap-3 rounded-card border border-brand/15 bg-surface/90 p-4 ${className}`}>
      <span className="pointer-events-none absolute -left-px -top-px h-3.5 w-3.5 rounded-tl-card border-l-2 border-t-2 border-brand" />
      <span className="pointer-events-none absolute -bottom-px -right-px h-3.5 w-3.5 rounded-br-card border-b-2 border-r-2 border-brand" />
      <h2 className="font-mono text-xs uppercase tracking-[.14em] text-text-muted">{label}</h2>
      {children}
    </section>
  );
}

export default async function NucleoPage() {
  const d = await getNucleoData();
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "America/Lima", hour: "2-digit", hour12: false }).format(new Date()));
  const orbLabel = d.week ? `Semana ${d.week.number}` : d.daysToStart ? `Faltan ${d.daysToStart} d` : "Temporada";

  return (
    <div className="flex flex-col gap-4">
      <header>
        <p className="font-mono text-xs uppercase tracking-[.14em] text-text-muted">{d.todayISO}</p>
        <h1 className="text-2xl font-semibold text-text">{greetingFor(hour)}, Marco</h1>
      </header>

      <div className="grid gap-4 lg:grid-cols-[310px_1fr_310px]">
        <div className="flex flex-col gap-4">
          <Panel label="Resultados de hoy">
            <Results tasks={d.tasks} />
          </Panel>
          <Panel label="Hito activo">
            {d.milestone ? (
              <>
                <p className="font-semibold text-text">
                  {d.milestone.number}. {d.milestone.title}
                </p>
                <p className="font-mono text-xs text-text-muted">Fecha: {d.milestone.due_on}</p>
                <ul className="list-disc pl-5 text-sm text-text-muted">
                  {d.milestone.criteria.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-text-muted">Sin hito pendiente.</p>
            )}
          </Panel>
        </div>

        <div className="flex flex-col items-center justify-center gap-4">
          <Orb hours={d.hours} label={orbLabel} />
          <div className="w-full max-w-sm">
            <HoursButtons hours={d.hours} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Panel label="Rachas y Ruta B">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="font-mono text-xs text-text-muted">Inglés hoy</dt>
                <dd className="text-text">{d.englishToday ? "Hecho" : "Pendiente"}</dd>
              </div>
              <div>
                <dt className="font-mono text-xs text-text-muted">Inglés semana</dt>
                <dd className="text-text">{d.englishWeek}/5</dd>
              </div>
              <div>
                <dt className="font-mono text-xs text-text-muted">Ruta B</dt>
                <dd className="text-text">{d.routeB}/5</dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>

      <Panel label="Jarvis">
        <CommandBar tasks={d.tasks} hours={d.hours} />
      </Panel>
    </div>
  );
}
