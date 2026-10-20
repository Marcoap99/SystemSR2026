import type { ReactNode } from "react";

/** Panel HUD del sistema de diseño Daily System (esquinas de corchete, etiqueta mono). */
export function HudPanel({
  label,
  children,
  className = "",
  as: Tag = "section",
}: {
  label?: string;
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "aside";
}) {
  return (
    <Tag className={`hud-panel flex min-h-0 flex-col gap-3 p-4 ${className}`}>
      {label ? <h2 className="hud-label">{label}</h2> : null}
      {children}
    </Tag>
  );
}
