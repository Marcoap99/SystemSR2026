import { Card } from "@/components/ui/Card";

const NORTH_STAR =
  'Llegar a la renovación de contrato del 31 de enero de 2027 con evidencia suficiente para cambiar de puesto (quitar el "Jr").';

// Los 5 guardrails son el subconjunto de los 9 principios de diseño del PRD
// (sección 2, no negociables) que protegen al usuario de los patrones que
// este tipo de sistema suele generar -- puntaje, castigo, comparación,
// ansiedad permanente. Reformulados en tono de lectura, no de spec técnica,
// pero sin agregar ninguna regla nueva.
const GUARDRAILS = [
  { title: "La moneda es evidencia, no puntos", detail: "No hay XP ni puntaje en ningún lado del sistema." },
  {
    title: "El contador solo aparece cerca de un boss fight",
    detail: "Oculto por defecto — nada de ansiedad permanente por una fecha lejana.",
  },
  {
    title: "Sin penalizaciones",
    detail: "Lo único que se pierde al fallar es la racha. Nada resta, nada castiga.",
  },
  {
    title: "Sin comparación social",
    detail: "No hay leaderboard, ranking ni puesto frente a nadie más.",
  },
  {
    title: 'Los techos nunca se muestran como cuota',
    detail: 'Nunca "0/2" — un límite mensual se lee como progreso, no como examen.',
  },
] as const;

/** B.1.2 — North Star arriba, los 5 guardrails como tarjetas. */
export function NorthStarGuardrails() {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-text">North Star</h2>
      <p className="mt-2 text-base text-text">{NORTH_STAR}</p>

      <h3 className="mt-6 text-sm font-semibold tracking-wide text-text-muted uppercase">Guardrails</h3>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {GUARDRAILS.map((g) => (
          <div key={g.title} className="rounded-card border border-border p-3">
            <p className="text-sm font-semibold text-text">{g.title}</p>
            <p className="mt-1 text-xs text-text-muted">{g.detail}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
