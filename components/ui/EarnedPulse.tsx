"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * C.5: al ganar un sello o una insignia, escala 1→1.08→1 + glow + fade-in
 * de la fecha (500ms) -- pero solo la primera vez que se ve, no en cada
 * carga de la página mientras siga ganado. `id` tiene que ser estable y
 * único por sello/insignia (p. ej. "seal:L1", "badge:constante").
 */
export function EarnedPulse({
  id,
  earned,
  children,
}: {
  id: string;
  earned: boolean;
  children: (justEarned: boolean) => ReactNode;
}) {
  const [justEarned, setJustEarned] = useState(false);

  useEffect(() => {
    if (!earned) return;
    const key = `earned-seen:${id}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // rAF, no una llamada directa: es la misma forma que ya usa CountUp
    // para animar sin pisar la regla set-state-in-effect.
    const frame = requestAnimationFrame(() => setJustEarned(true));
    return () => cancelAnimationFrame(frame);
  }, [earned, id]);

  return <>{children(justEarned)}</>;
}
