import { getNucleoData } from "@/lib/data/ds-nucleo";
import { greetingFor } from "@/lib/domain/ds";
import { OrbStage } from "@/components/nucleo/OrbStage";
import { BootSequence } from "@/components/nucleo/BootSequence";
import { CounterStrip } from "@/components/nucleo/CounterStrip";
import { HudPanel } from "@/components/ui/HudPanel";
import { Results } from "@/components/nucleo/Results";
import { HoursButtons } from "@/components/nucleo/HoursButtons";
import { CommandBar } from "@/components/nucleo/CommandBar";

export const dynamic = "force-dynamic";

export default async function NucleoPage() {
  const d = await getNucleoData();
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "America/Lima", hour: "2-digit", hour12: false }).format(new Date()));
  const orbLabel = d.week ? `Semana ${d.week.number}` : d.daysToStart ? `Faltan ${d.daysToStart} d` : "Temporada";

  return (
    <div className="flex flex-col gap-4">
      <BootSequence />
      <header>
        <p className="font-mono text-xs uppercase tracking-[.14em] text-text-muted">{d.todayISO}</p>
        <h1 className="text-2xl font-semibold text-text">{greetingFor(hour)}, Marco</h1>
      </header>

      {d.zeroAlert ? (
        <p role="status" className="rounded-card border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn">
          Ayer quedó en cero. Hoy no se repite: cierra un resultado chico, suma media hora o marca el día mínimo viable.
        </p>
      ) : d.daysToStart ? (
        <p role="status" className="rounded-card border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-text">
          Faltan {d.daysToStart} días para el arranque del 19 de octubre.
        </p>
      ) : null}

      <CounterStrip data={d} />

      <div className="grid gap-4 lg:grid-cols-[310px_1fr_310px]">
        <div className="flex flex-col gap-4">
          <HudPanel label="Resultados de hoy">
            <Results tasks={d.tasks} />
          </HudPanel>
          <HudPanel label="Hito activo">
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
          </HudPanel>
        </div>

        <div className="flex flex-col items-center justify-center gap-4">
          <OrbStage hours={d.hours} label={orbLabel} />
          <div className="w-full max-w-sm">
            <HoursButtons hours={d.hours} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <HudPanel label="Rachas y Ruta B">
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
                <dt className="font-mono text-xs text-text-muted">Duolingo</dt>
                <dd className="text-text">{d.duolingo ? `${d.duolingo.current} días (récord ${d.duolingo.longest})` : "—"}</dd>
              </div>
              <div>
                <dt className="font-mono text-xs text-text-muted">Ruta B</dt>
                <dd className="text-text">{d.routeB}/5</dd>
              </div>
            </dl>
          </HudPanel>
        </div>
      </div>

      <HudPanel label="Jarvis">
        <CommandBar tasks={d.tasks} hours={d.hours} />
      </HudPanel>
    </div>
  );
}
