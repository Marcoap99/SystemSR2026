import type { Boss } from "@/lib/types";

/**
 * 7.1 (2) / P4 / 6.7: SOLO se renderiza cuando el caller (page.tsx) ya
 * decidió showCountdown === true. No hay una versión "oculta" de esto en
 * el DOM — si no aplica, este componente ni se monta.
 */
export function Countdown({ boss, days }: { boss: Boss; days: number }) {
  return (
    <div className="rounded-card border border-warn/40 bg-warn/10 px-4 py-3 text-sm font-medium text-warn">
      <span className="tabular-nums">
        {boss.name} en {days} {days === 1 ? "día" : "días"}
      </span>
      <span className="text-warn/80"> — {boss.criterion}</span>
    </div>
  );
}
