import { Card } from "@/components/ui/Card";

const POINTS = [
  {
    when: "Semana 5 (7-13 sep)",
    what: "Pedir el cambio en la renovación o en el ciclo formal.",
    with: "Respuestas de CN4 y CN7.",
  },
  {
    when: "Semana 25 / enero",
    what: "Aceptar la renovación tal cual o negociar.",
    with: "El expediente + lectura del año.",
  },
] as const;

/** B.1.5 — puntos de decisión: cuándo, qué se decide, con qué información. */
export function DecisionPoints() {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-text">Puntos de decisión</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-text-muted">
              <th className="py-2 pr-3 font-medium">Cuándo</th>
              <th className="py-2 pr-3 font-medium">Qué se decide</th>
              <th className="py-2 font-medium">Con qué información</th>
            </tr>
          </thead>
          <tbody>
            {POINTS.map((p) => (
              <tr key={p.when} className="border-b border-border align-top last:border-0">
                <td className="py-2 pr-3 font-mono whitespace-nowrap text-text-muted">{p.when}</td>
                <td className="py-2 pr-3 text-text">{p.what}</td>
                <td className="py-2 text-text-muted">{p.with}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
