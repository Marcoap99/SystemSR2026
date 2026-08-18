import { Card } from "@/components/ui/Card";

interface TimelineStep {
  label: string;
  date: string;
  detail?: string;
  here?: boolean;
  goal?: boolean;
}

const MAIN_STEPS: TimelineStep[] = [
  {
    label: "Strategic Researcher Jr",
    date: "ago 2026",
    detail: "Precedente: Jhoanna subió en 6 meses.",
    here: true,
  },
  {
    label: "Strategic Researcher",
    date: "ene 2027",
    detail: "Vía: solicitud del jefe en la renovación (no ciclo formal).",
    goal: true,
  },
  {
    label: "12 meses cumplidos",
    date: "ago 2027",
    detail: "Se habilita el movimiento.",
  },
];

const BRANCHES = [
  { label: "Product Owner Jr", when: "2027-2028", note: "ruta principal" },
  { label: "Product Growth", when: "2027-2028", note: "Kevin Vilcherres" },
  { label: "Nuevos Productos", when: "2027-2028", note: "mejor encaje de perfil" },
  { label: "Strategic Research Specialist", when: "2027-2028", note: "ruta de profundidad" },
];

/** B.1.3 — timeline vertical hasta PO, con la nota de contexto fija abajo. */
export function CareerTimeline() {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-text">La ruta hasta PO</h2>

      <div className="mt-5 flex flex-col">
        {MAIN_STEPS.map((step, i) => (
          <div key={step.label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={
                  "mt-1 h-3 w-3 shrink-0 rounded-full border-2 " +
                  (step.here || step.goal ? "border-brand bg-brand" : "border-border bg-surface")
                }
                aria-hidden="true"
              />
              {i < MAIN_STEPS.length - 1 ? <span className="w-px flex-1 bg-border" aria-hidden="true" /> : null}
            </div>
            <div className="pb-6">
              <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-text">
                {step.label}
                <span className="font-mono text-xs font-normal text-text-muted">{step.date}</span>
                {step.here ? (
                  <span className="rounded-badge bg-brand/10 px-1.5 py-0.5 text-[11px] font-medium text-brand-dark">
                    estás acá
                  </span>
                ) : null}
                {step.goal ? (
                  <span className="rounded-badge bg-badge-yellow-bg px-1.5 py-0.5 text-[11px] font-medium text-badge-yellow-text">
                    meta
                  </span>
                ) : null}
              </p>
              {step.detail ? <p className="mt-0.5 text-xs text-text-muted">{step.detail}</p> : null}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs font-medium tracking-wide text-text-muted uppercase">Desde ahí, 4 ramas posibles</p>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {BRANCHES.map((b) => (
          <div key={b.label} className="rounded-card border border-border p-3">
            <p className="text-sm font-medium text-text">{b.label}</p>
            <p className="mt-0.5 font-mono text-xs text-text-muted">{b.when}</p>
            <p className="text-xs text-text-muted">{b.note}</p>
          </div>
        ))}
      </div>

      <p className="mt-5 border-t border-border pt-4 text-sm text-text-muted italic">
        La antesala de PO en Prestamype es Arquitectura de Negocio, no research. No hay precedente de
        research → PO. Serías el primero: hay que construir el argumento, no esperarlo.
      </p>
    </Card>
  );
}
