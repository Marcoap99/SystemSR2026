"use client";

import { useEffect, useState } from "react";
import { GradientWave } from "@/components/ui/gradient-wave";
import { ShaderBackground as PlasmaBackground } from "@/components/ui/light-blue-plasma-shader-w-grain-interactive";

function readTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

// Apagador manual de diagnóstico: ?sin-fondo=1 en la URL. No es una
// preferencia que se guarda -- es solo para poder confirmar en el
// momento si un problema de rendimiento viene de acá o no, sin tener
// que tocar código para probarlo.
function shaderDisabledByQuery(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("sin-fondo") === "1";
}

/**
 * Fondo animado global, uno por tema: GradientWave (ola de gradiente
 * celeste/blanco) en claro, el shader oscuro rojo/naranja con grano en
 * dark -- el default de la app (C.1). Solo uno de los dos vive montado
 * a la vez: cada uno corre su propio contexto WebGL + loop de rAF, así
 * que tenerlos ambos activos sería el doble de GPU/batería por nada;
 * el unmount del que no se usa libera su contexto solo.
 *
 * Segundo intento de fondo claro: primero fue Silk (paleta casi blanca
 * a propósito, terminaba leyéndose como "la página es blanca"), después
 * WarpBackground (grilla 3D + beams). Este reemplaza a WarpBackground.
 * Ninguno de los anteriores se borró -- quedan sin usar en
 * components/ui/ por si hace falta volver.
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
  const [disabled] = useState(() => shaderDisabledByQuery());

  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(readTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  if (disabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
      {theme === "light" ? (
        <GradientWave className="h-full w-full" />
      ) : (
        <PlasmaBackground className="h-full w-full" />
      )}
    </div>
  );
}
