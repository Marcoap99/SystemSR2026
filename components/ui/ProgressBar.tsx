/**
 * Barra de progreso (6.3): 0% gris, 1-99% verde con track gris,
 * 100% verde lleno + check. El ratio SIEMPRE llega calculado por el
 * caller a partir de artefactos — este componente no guarda ni deriva
 * ningún porcentaje, solo lo pinta.
 */
export function ProgressBar({ ratio, showCheck = true }: { ratio: number; showCheck?: boolean }) {
  const clamped = Math.max(0, Math.min(1, ratio));
  const complete = clamped >= 1;

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-bar bg-border">
        <div
          className="h-full rounded-bar bg-brand transition-[width] duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
          style={{ width: `${clamped * 100}%` }}
        />
      </div>
      {complete && showCheck ? (
        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-brand">
          <path
            className="animate-draw-check"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.3 9.7l3.8 3.8 6.8-6.8"
          />
        </svg>
      ) : null}
    </div>
  );
}
