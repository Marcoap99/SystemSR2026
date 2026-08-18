"use client";

import { useEffect, useState } from "react";
import { ShaderBackground as SilkBackground } from "@/components/ui/silk-shader";
import { ShaderBackground as PlasmaBackground } from "@/components/ui/light-blue-plasma-shader-w-grain-interactive";

function readTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

/**
 * Fondo animado global, uno por tema: Silk (celeste suave) en claro,
 * el shader oscuro rojo/naranja con grano en dark -- el default de la
 * app (C.1). Solo uno de los dos vive montado a la vez: cada uno corre
 * su propio contexto WebGL + loop de rAF, así que tenerlos ambos activos
 * sería el doble de GPU/batería por nada, y el unmount del que no se usa
 * ya libera su contexto solo (ver el cleanup de ShaderBackground).
 *
 * ThemeToggle no usa React state -- pisa el atributo `data-theme` del
 * DOM directamente, a propósito, para evitar el flash/desajuste de
 * hidratación (ver su propio comentario) -- así que este componente se
 * entera de un cambio de tema con un MutationObserver, no con
 * prop/contexto. Fijo detrás de todo (`-z-10`, `pointer-events-none`):
 * el contenido real vive en tarjetas opacas (`bg-surface`) encima, así
 * que esto solo se ve en los espacios entre tarjetas.
 */
export function ThemeShaderBackground() {
  const [theme, setTheme] = useState<"light" | "dark">(() => readTheme());

  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(readTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
      {theme === "light" ? (
        <SilkBackground className="h-full w-full" />
      ) : (
        <PlasmaBackground className="h-full w-full" />
      )}
    </div>
  );
}
