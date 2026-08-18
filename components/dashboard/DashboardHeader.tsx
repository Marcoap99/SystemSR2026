import { Card } from "@/components/ui/Card";
import { PhaseSegments } from "@/components/dashboard/PhaseSegments";
import type { Phase, Week } from "@/lib/types";

function formatShort(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

// App de un solo usuario, sin tabla de perfil — el nombre es un literal a
// propósito (C.2), igual que el resto de las etiquetas fijas de la app.
const USER_NAME = "Marcoantonio";
const TOTAL_WEEKS = 18;

/**
 * 7.1 (1) + V1.1 C.2/C.6: saludo contextual, semana/fase en una línea, la
 * frase de estado (ya resuelta por contextualGreeting) y la barra de fase
 * segmentada en 18 bloques en vez de continua.
 */
export function DashboardHeader({
  week,
  phase,
  phaseRatio,
  greeting,
}: {
  week: Week | null;
  phase: Phase | null;
  phaseRatio: number;
  greeting: string;
}) {
  return (
    <Card>
      <p className="text-xl font-semibold text-text">Hola, {USER_NAME}.</p>

      <p className="mt-1 font-mono text-sm text-text-muted">
        {week ? `Semana ${week.number} de ${TOTAL_WEEKS}` : "Semana no configurada"}
        {phase ? ` · Fase ${phase.number}: ${phase.name}` : ""}
      </p>

      <p className="mt-2 text-sm text-text">{greeting}</p>

      {week ? (
        <p className="mt-3 font-mono text-xs text-text-muted">
          {formatShort(week.start_date)} – {formatShort(week.end_date)}
          {week.focus ? ` · ${week.focus}` : ""}
        </p>
      ) : null}
      {phase?.rule ? <p className="mt-1 text-sm text-text-muted">{phase.rule}</p> : null}

      <div className="mt-4">
        <PhaseSegments ratio={phaseRatio} />
      </div>
    </Card>
  );
}
