import type { ExposureEvent } from "@/lib/types";

/** 7.5: historial de eventos. Los que no cuentan (sin output) se marcan aparte. */
export function EventHistory({ events }: { events: ExposureEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-text-muted">Todavía no hay eventos registrados.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-text-muted">
            <th className="py-2 pr-3 font-medium">Fecha</th>
            <th className="py-2 pr-3 font-medium">Tipo</th>
            <th className="py-2 pr-3 font-medium">Evento</th>
            <th className="py-2 font-medium">Salida</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="border-b border-border last:border-0">
              <td className="py-2 pr-3 font-mono whitespace-nowrap text-text-muted">{event.date}</td>
              <td className="py-2 pr-3 font-mono whitespace-nowrap text-text-muted">{event.exposure_code}</td>
              <td className="py-2 pr-3 text-text">{event.name}</td>
              <td className="py-2 text-text-muted">
                {event.counts ? event.output : <span className="text-warn">Sin salida — no cuenta</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
