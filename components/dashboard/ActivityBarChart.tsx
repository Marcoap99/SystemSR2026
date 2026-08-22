import { formatDMY, formatShortEs } from "@/lib/domain/dates";
import type { HeatmapDay } from "@/lib/domain/heatmap";

const BAR_MAX_HEIGHT = 80; // px
const BAR_WIDTH = 18; // px -- dentro del límite de 24px de grosor del spec de barras

function cellTitle(day: HeatmapDay): string {
  const date = formatDMY(day.date);
  if (day.count === 0) return `${date}: sin actividad`;
  return `${date}: ${day.labels.join(", ")}`;
}

/**
 * V1.5 — vista "Reciente" del bloque de actividad: una sola serie
 * (cantidad de eventos por día), una barra por día, con solo el rango
 * visible (7/14/30, lo filtra ActivitySection) en vez de los 6 meses
 * completos del calendario -- pensada para leerse como "cuánto hice
 * esta semana/mes", no como un patrón largo.
 *
 * Los días sin actividad quedan en gris (bg-surface-2), no en verde
 * apagado -- una barra verde, aunque tenue, se lee como "algo pasó" y
 * acá no pasó nada. Escala contra el máximo del propio rango visible
 * (no el de los 6 meses), así el rango corto siempre usa el alto
 * completo del gráfico.
 */
export function ActivityBarChart({ days }: { days: HeatmapDay[] }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  const labelEvery = Math.max(1, Math.ceil(days.length / 6));

  return (
    <div>
      <div className="overflow-x-auto pb-1">
        <div className="flex items-end gap-1" style={{ height: BAR_MAX_HEIGHT }}>
          {days.map((day) => {
            const height = day.count > 0 ? Math.max(6, Math.round((day.count / max) * BAR_MAX_HEIGHT)) : 3;
            return (
              <div
                key={day.date}
                title={cellTitle(day)}
                className={
                  "shrink-0 rounded-t-[4px] transition-opacity hover:opacity-70 " +
                  (day.count > 0 ? "bg-brand" : "bg-surface-2")
                }
                style={{ width: BAR_WIDTH, height }}
              />
            );
          })}
        </div>
      </div>

      {/* Etiquetas del eje X -- selectivas (nunca una por barra en 14/30, sería ruido). */}
      <div className="mt-1 flex gap-1 overflow-x-auto">
        {days.map((day, i) => (
          <div
            key={day.date}
            className="shrink-0 whitespace-nowrap text-center text-[10px] text-text-muted"
            style={{ width: BAR_WIDTH }}
          >
            {i % labelEvery === 0 ? formatShortEs(day.date) : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
