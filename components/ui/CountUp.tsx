"use client";

import { useEffect, useRef, useState } from "react";

const DURATION_MS = 400;

/**
 * C.5: cuenta desde el valor anterior al nuevo en 400ms. Al montar no
 * anima nada (no hay "anterior" real todavía) — solo anima cuando `value`
 * cambia en un re-render posterior (p. ej. después de un Server Action +
 * revalidatePath). Respeta prefers-reduced-motion saltando directo al
 * valor final.
 */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    const from = prevValue.current;
    const to = value;
    prevValue.current = value;
    if (from === to) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frameId: number;
    const start = performance.now();
    function tick(now: number) {
      if (reduceMotion) {
        setDisplay(to);
        return;
      }
      const t = Math.min(1, (now - start) / DURATION_MS);
      setDisplay(Math.round(from + (to - from) * t));
      if (t < 1) frameId = requestAnimationFrame(tick);
    }
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return <span className={className}>{display}</span>;
}
