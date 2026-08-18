/**
 * C.6: la barra de fase como 18 segmentos (uno por semana del programa) en
 * vez de una barra continua — se ve el avance semana a semana, no solo un
 * porcentaje difuso. El ratio sigue viniendo ya calculado (phaseProgress),
 * este componente solo lo reparte en bloques.
 */
const TOTAL_WEEKS = 18;

export function PhaseSegments({ ratio }: { ratio: number }) {
  const clamped = Math.max(0, Math.min(1, ratio));
  const filled = Math.round(clamped * TOTAL_WEEKS);

  return (
    <div className="flex gap-1" role="img" aria-label={`Progreso de fase: ${filled} de ${TOTAL_WEEKS} semanas`}>
      {Array.from({ length: TOTAL_WEEKS }).map((_, i) => (
        <div
          key={i}
          className={`h-2 flex-1 rounded-[2px] ${i < filled ? "bg-brand" : "bg-border"}`}
        />
      ))}
    </div>
  );
}
