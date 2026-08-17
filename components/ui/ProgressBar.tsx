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
          className="h-full rounded-bar bg-brand transition-[width]"
          style={{ width: `${clamped * 100}%` }}
        />
      </div>
      {complete && showCheck ? (
        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-brand">
          <path
            fill="currentColor"
            d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
          />
        </svg>
      ) : null}
    </div>
  );
}
