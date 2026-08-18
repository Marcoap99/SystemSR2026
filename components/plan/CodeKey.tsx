import { Card } from "@/components/ui/Card";

const PREFIXES = [
  { prefix: "AR", means: "Aprender — competencia de rol", example: "AR4 Síntesis" },
  { prefix: "AM", means: "Aprender — habilitador de mercado", example: "AM1 Inglés input" },
  { prefix: "AT", means: "Aprender — herramienta (Claude)", example: "AT2 Skills" },
  { prefix: "G", means: "Generar — artefacto", example: "G3.3 Informe con síntesis" },
  { prefix: "L", means: "Lograr — resultado con criterio binario", example: "L2 Decisión movida" },
  { prefix: "CN", means: "Conectar — conexión interna", example: "CN2 Cesar Altamirano" },
  { prefix: "EX", means: "Exponer — exposición externa", example: "EX4 Dar una charla" },
] as const;

const GLOSSARY = [
  { term: "North Star", def: "El objetivo final que justifica todo lo demás." },
  { term: "Guardrail", def: "Una regla que protege el sistema de sus propios excesos." },
  { term: "Boss fight", def: "Una fecha real con criterio binario de éxito — no una metáfora vacía." },
  { term: "Freeze", def: "Perdón de una racha saltada, limitado por trimestre." },
  { term: "Quest", def: "Lo concreto de esta semana, derivado del plan — no una tarea suelta." },
  { term: "Sello", def: "Un resultado logrado (L), binario: se tiene o no se tiene." },
  { term: "Barra", def: "El progreso gradual de un grupo de artefactos (G)." },
  { term: "Tier", def: "Núcleo / utilitario / archivo — qué tan esencial es un recurso." },
  { term: "Fase", def: "Un tramo del plan con su propia regla de conducta." },
] as const;

/** B.1.6 — glosario de códigos y de conceptos, siempre visible (sin colapsar). */
export function CodeKey() {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-text">🔑 Key</h2>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-text-muted">
              <th className="py-2 pr-3 font-medium">Prefijo</th>
              <th className="py-2 pr-3 font-medium">Significa</th>
              <th className="py-2 font-medium">Ejemplo</th>
            </tr>
          </thead>
          <tbody>
            {PREFIXES.map((p) => (
              <tr key={p.prefix} className="border-b border-border last:border-0">
                <td className="py-2 pr-3 font-mono font-semibold text-text">{p.prefix}</td>
                <td className="py-2 pr-3 text-text-muted">{p.means}</td>
                <td className="py-2 font-mono text-text-muted">{p.example}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mt-6 text-sm font-semibold tracking-wide text-text-muted uppercase">Glosario</h3>
      <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        {GLOSSARY.map((g) => (
          <div key={g.term}>
            <dt className="text-sm font-medium text-text">{g.term}</dt>
            <dd className="text-xs text-text-muted">{g.def}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
