import type { LogEntry } from "@/lib/types";

/** 7.6: tabla de todas las entradas. */
export function LogTable({ entries }: { entries: LogEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-text-muted">Todavía no hay entradas.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-text-muted">
            <th className="py-2 pr-3 font-medium">Fecha</th>
            <th className="py-2 pr-3 font-medium">Semana</th>
            <th className="py-2 pr-3 font-medium">Qué hice</th>
            <th className="py-2 pr-3 font-medium">Qué prueba queda</th>
            <th className="py-2 font-medium">Ref</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-border align-top last:border-0">
              <td className="py-2 pr-3 whitespace-nowrap text-text-muted">{entry.date}</td>
              <td className="py-2 pr-3 whitespace-nowrap text-text-muted tabular-nums">
                {entry.week_number}
              </td>
              <td className="py-2 pr-3 text-text">{entry.what}</td>
              <td className="py-2 pr-3 text-text-muted">{entry.evidence}</td>
              <td className="py-2 text-text-muted">{entry.ref_code ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
