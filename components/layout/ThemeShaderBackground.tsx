"use client";

import { useEffect, useState } from "react";
import { WarpBackground } from "@/components/ui/warp-background";
import { ShaderBackground as PlasmaBackground } from "@/components/ui/light-blue-plasma-shader-w-grain-interactive";

function readTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

/**
 * Fondo animado global, uno por tema: WarpBackground (beams de colores
 * sobre una grilla 3D) en claro, el shader oscuro rojo/naranja con
 * grano en dark -- el default de la app (C.1). Solo uno de los dos
 * vive montado a la vez: el shader de dark corre su propio contexto
 * WebGL + loop de rAF (tenerlo montado en claro también sería el doble
 * de GPU/batería por nada), y WarpBackground anima con CSS/Motion, más
 * liviano. El unmount del que no se usa libera su contexto solo.
 *
 * WarpBackground es un componente pensado para envolver contenido
 * (nace con `rounded border p-20` y una franja "cóncava" de grilla):
 * acá no lo usamos así -- se le pasa `children` vacío y se le anula
 * el borde/padding por className (tailwind-merge se come el choque),
 * para que quede como capa decorativa de fondo, igual que el shader de
 * dark. Silk (components/ui/silk-shader.tsx) queda sin usar pero no se
 * borra -- se cambió porque a colores tan pálidos casi no se notaba en
 * claro (fondo/tarjetas ya son casi blancos ahí).
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
        <WarpBackground
          className="h-full w-full rounded-none border-0 p-0"
          gridColor="var(--color-border)"
          beamsPerSide={4}
          beamSize={6}
          beamDuration={4}
        >
          <></>
        </WarpBackground>
      ) : (
        <PlasmaBackground className="h-full w-full" />
      )}
    </div>
  );
}
