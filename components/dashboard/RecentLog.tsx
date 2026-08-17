import { Card } from "@/components/ui/Card";
import type { LogEntry } from "@/lib/types";
import { NewLogEntryModal } from "./NewLogEntryModal";

/** 7.1 (7): últimas 5 entradas + botón "Nueva entrada". */
export function RecentLog({ entries }: { entries: LogEntry[] }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text">Log</h2>
        <NewLogEntryModal />
      </div>

      <ul className="mt-4 flex flex-col gap-3">
        {entries.length === 0 ? (
          <p className="text-sm text-text-muted">Todavía no hay entradas.</p>
        ) : (
          entries.map((entry) => (
            <li key={entry.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
              <div className="flex items-center justify-between gap-2 text-xs text-text-muted">
                <span>{entry.date}</span>
                {entry.ref_code ? (
                  <span className="rounded-badge bg-bg px-1.5 py-0.5">{entry.ref_code}</span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-text">{entry.what}</p>
              <p className="text-sm text-text-muted">{entry.evidence}</p>
            </li>
          ))
        )}
      </ul>
    </Card>
  );
}
