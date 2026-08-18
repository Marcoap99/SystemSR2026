import { Card } from "@/components/ui/Card";
import { BADGES, type BadgeState } from "@/lib/domain/badges";
import { formatDMY } from "@/lib/domain/dates";

/**
 * V1.1 C.3: grid de insignias, estilo Claude Hackers pero por evidencia
 * de producción, nunca por consumo. Ninguna acá se desbloquea marcando un
 * recurso de /aprender como visto — evaluateBadges ni siquiera recibe esos
 * datos. Solo lectura: no hay acción, se ganan solas al cerrar el trabajo
 * real en otras pantallas.
 */
export function Insignias({ badges }: { badges: BadgeState[] }) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-text">Insignias</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {badges.map((state) => {
          const def = BADGES.find((b) => b.id === state.id)!;
          return (
            <div
              key={state.id}
              title={def.earnedWith}
              className={
                "flex flex-col items-center gap-1 rounded-card border p-3 text-center transition-transform " +
                (state.earned
                  ? "border-brand/40 bg-brand/10 shadow-[0_0_16px_var(--color-brand-glow)]"
                  : "border-border bg-bg")
              }
            >
              <span className={"text-2xl " + (state.earned ? "" : "opacity-25 grayscale")} aria-hidden="true">
                {def.icon}
              </span>
              <span className={"text-xs font-medium " + (state.earned ? "text-text" : "text-text-muted")}>
                {def.label}
              </span>
              {state.earned && state.earnedAt ? (
                <span className="font-mono text-[10px] text-text-muted">
                  {formatDMY(state.earnedAt)}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
