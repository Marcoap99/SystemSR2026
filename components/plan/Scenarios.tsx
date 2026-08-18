import { Card } from "@/components/ui/Card";

const SCENARIOS = [
  { letter: "A", name: "Base", prob: "~50%", trigger: "RS en enero, consolidación, ventana en agosto." },
  { letter: "B", name: "Acelerado", prob: "~20%", trigger: "Se abre silla: producto nuevo o Growth crece." },
  {
    letter: "C",
    name: "Lento",
    prob: "~25%",
    trigger: "Reorg, presupuesto apretado, o llega un Research Lead externo.",
  },
  // B.2: nada del escenario D en detalle -- solo nombre, probabilidad y el
  // mismo nivel de gatillo que los demás, sin plan asociado ni fechas.
  { letter: "D", name: "Salir", prob: "~5-10%", trigger: "Nada se mueve en 2027 H2. No es fracaso." },
] as const;

/** B.1.4 — los 4 escenarios, con la nota de que el plan de 12 meses sirve en los 4. */
export function Scenarios() {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-text">Los 4 escenarios</h2>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SCENARIOS.map((s) => (
          <div key={s.letter} className="rounded-card border border-border p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-text">
                <span className="font-mono">{s.letter}</span> — {s.name}
              </p>
              <span className="font-mono text-xs font-medium text-text-muted tabular-nums">{s.prob}</span>
            </div>
            <p className="mt-2 text-xs text-text-muted">{s.trigger}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm text-text-muted italic">
        El plan de los próximos 12 meses sirve igual en los cuatro. Eso es lo que lo hace robusto.
      </p>
    </Card>
  );
}
