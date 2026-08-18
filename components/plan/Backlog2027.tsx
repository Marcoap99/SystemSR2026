import { Card } from "@/components/ui/Card";

const BACKLOG = [
  { item: "AM3 — SQL", when: "ene 2027", note: "Arranca cuando el inglés output tome su ritmo" },
  { item: "AM2 — Inglés output (conversación)", when: "ene 2027", note: "Bloque A, cuando SQL libere" },
  {
    item: "AR11 — IA aplicada a research y UX",
    when: "Q1 2027",
    note: "Pospuesto por priorización de gamificación. Requiere AR4 cerrado. Fuente base: curso Inspiratech 2026",
  },
  { item: "AT5 — Prompting para research", when: "Q1 2027", note: "Se fusiona con AR11" },
  { item: "Métricas de producto", when: "Q1 2027", note: "Funnel, cohortes, retención" },
  { item: "Diseño de experimentos (formal)", when: "Q1 2027", note: "" },
  { item: "Research cuantitativo aplicado", when: "Q1 2027", note: "Muestreo, validez" },
  { item: "Escritura de producto (PRD, historias)", when: "Q2 2027", note: "Cuando apunte a PO" },
  { item: "BPMN formal", when: "Q2 2027", note: "Se aprende haciendo el intake" },
  { item: "V2 de esta plataforma — Calendar", when: "oct 2026+", note: "Depende de OAuth" },
  { item: "V2 de esta plataforma — Jira", when: "cuando haya acceso", note: "Depende de credenciales" },
  { item: "Plan de estudios UI/UX (Saptarshi)", when: "dic 2027", note: "Solo si decide cruzar a diseño" },
  { item: "G1.7 — Integración form → Jira API", when: "fase 2", note: "El sandbox es esta plataforma" },
] as const;

/**
 * B.1.7 — colapsado por defecto (AC5). tier='backlog' es un concepto que
 * solo existe acá, como contenido estático de lectura: nada de esto vive
 * en `resources` ni en ninguna otra tabla, así que no puede aparecer en el
 * dashboard aunque quisiera -- no hay fila que mostrar.
 */
export function Backlog2027() {
  return (
    <Card>
      <details>
        <summary className="cursor-pointer text-lg font-semibold text-text select-none">
          Backlog 2027{" "}
          <span className="text-sm font-normal text-text-muted">— nada de esto es accionable en 2026</span>
        </summary>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-text-muted">
                <th className="py-2 pr-3 font-medium">Ítem</th>
                <th className="py-2 pr-3 font-medium">Cuándo</th>
                <th className="py-2 font-medium">Nota</th>
              </tr>
            </thead>
            <tbody>
              {BACKLOG.map((b) => (
                <tr key={b.item} className="border-b border-border last:border-0">
                  <td className="py-2 pr-3 text-text">{b.item}</td>
                  <td className="py-2 pr-3 font-mono whitespace-nowrap text-text-muted">{b.when}</td>
                  <td className="py-2 text-text-muted">{b.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </Card>
  );
}
