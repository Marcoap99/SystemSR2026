import { Card } from "@/components/ui/Card";
import { addDays, formatDMY, mondayOf } from "@/lib/domain/dates";
import type { HeatmapDay, IntensityLevel } from "@/lib/domain/heatmap";

const LEVEL_CLASS: Record<IntensityLevel, string> = {
  0: "bg-surface-2",
  1: "bg-brand/25",
  2: "bg-brand/50",
  3: "bg-brand/75",
  4: "bg-brand",
};

function buildColumns(days: HeatmapDay[]): (HeatmapDay | null)[][] {
  if (days.length === 0) return [];
  const byDate = new Map(days.map((d) => [d.date, d]));
  const start = mondayOf(days[0]!.date);
  const endSunday = addDays(mondayOf(days[days.length - 1]!.date), 6);

  const columns: (HeatmapDay | null)[][] = [];
  let column: (HeatmapDay | null)[] = [];
  let cursor = start;
  while (cursor <= endSunday) {
    column.push(byDate.get(cursor) ?? null);
    if (column.length === 7) {
      columns.push(column);
      column = [];
    }
    cursor = addDays(cursor, 1);
  }
  return columns;
}

function cellTitle(day: HeatmapDay): string {
  const date = formatDMY(day.date);
  if (day.count === 0) return `${date}: sin actividad`;
  return `${date}: ${day.labels.join(", ")}`;
}

/**
 * V1.1 C.4 — calendario de contribuciones estilo GitHub, últimos 6 meses.
 * Servidor puro: el tooltip usa el `title` nativo, no hace falta JS.
 */
export function ActivityHeatmap({ days, activeDays }: { days: HeatmapDay[]; activeDays: number }) {
  const columns = buildColumns(days);

  return (
    <Card>
      <h2 className="text-lg font-semibold text-text">Actividad</h2>

      <div className="mt-4 overflow-x-auto pb-2">
        <div className="flex gap-1">
          {columns.map((column, i) => (
            <div key={i} className="flex flex-col gap-1">
              {column.map((day, j) =>
                day ? (
                  <div
                    key={j}
                    title={cellTitle(day)}
                    className={`h-3 w-3 rounded-[2px] ${LEVEL_CLASS[day.level]}`}
                  />
                ) : (
                  <div key={j} className="h-3 w-3 rounded-[2px] bg-transparent" />
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-text-muted">
          <span className="font-mono">{activeDays}</span> días activos en los últimos 6 meses
        </p>
        <div className="flex items-center gap-1 text-xs text-text-muted">
          <span>Menos</span>
          {([0, 1, 2, 3, 4] as IntensityLevel[]).map((level) => (
            <div key={level} className={`h-3 w-3 rounded-[2px] ${LEVEL_CLASS[level]}`} />
          ))}
          <span>Más</span>
        </div>
      </div>
    </Card>
  );
}
