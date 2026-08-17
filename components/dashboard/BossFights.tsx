import { Card } from "@/components/ui/Card";
import type { Boss } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  won: "Ganado",
  lost: "Perdido",
};

function statusClass(status: string) {
  if (status === "won") return "bg-badge-green-bg text-badge-green-text";
  if (status === "lost") return "bg-warn/15 text-warn";
  return "bg-badge-yellow-bg text-badge-yellow-text";
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** 7.1 (8): 3 tarjetas horizontales con fecha, criterio y estado. Solo lectura en V1. */
export function BossFights({ bosses }: { bosses: Boss[] }) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-text">Boss fights</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {bosses.map((boss) => (
          <div key={boss.number} className="rounded-card border border-border p-4">
            <p className="text-sm font-semibold text-text">{boss.name}</p>
            <p className="mt-1 text-xs text-text-muted">{formatDate(boss.date)}</p>
            <p className="mt-2 text-sm text-text-muted">{boss.criterion}</p>
            <span
              className={
                "mt-3 inline-block rounded-badge px-2 py-0.5 text-xs font-medium " + statusClass(boss.status)
              }
            >
              {STATUS_LABEL[boss.status] ?? boss.status}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
