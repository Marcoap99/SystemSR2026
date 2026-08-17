import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { Phase, Week } from "@/lib/types";

function formatShort(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

/** 7.1 (1): semana actual + barra de fase + fase activa. */
export function DashboardHeader({
  week,
  phase,
  phaseRatio,
}: {
  week: Week | null;
  phase: Phase | null;
  phaseRatio: number;
}) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-text-muted">
            {week
              ? `Semana ${week.number} · ${formatShort(week.start_date)} – ${formatShort(week.end_date)}`
              : "Semana no configurada"}
          </p>
          {week?.focus ? <p className="mt-1 text-xl font-semibold text-text">{week.focus}</p> : null}
        </div>

        {phase ? (
          <div className="text-right">
            <p className="text-sm font-medium text-text-muted">Fase activa</p>
            <p className="text-base font-semibold text-text">{phase.name}</p>
          </div>
        ) : null}
      </div>

      {phase?.rule ? <p className="mt-2 text-sm text-text-muted">{phase.rule}</p> : null}

      <div className="mt-4">
        <ProgressBar ratio={phaseRatio} showCheck={false} />
      </div>
    </Card>
  );
}
