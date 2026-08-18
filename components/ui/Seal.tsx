/**
 * Sello (6.4): binario, no gradual. Apagado = gris; logrado = morado
 * (`secondary`). El criterio se ve al hacer hover (title nativo).
 */
export function Seal({ code, achieved, criterion }: { code: string; achieved: boolean; criterion: string }) {
  return (
    <div
      title={criterion}
      className={
        "flex h-12 w-12 shrink-0 cursor-default items-center justify-center rounded-full border font-mono text-xs font-semibold " +
        (achieved
          ? "border-secondary bg-secondary text-white"
          : "border-border bg-surface text-text-muted")
      }
    >
      {code}
    </div>
  );
}
