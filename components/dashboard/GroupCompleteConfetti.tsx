"use client";

import { useEffect, useState } from "react";

const COLORS = ["var(--color-brand)", "var(--color-secondary)"];
const PARTICLE_COUNT = 12;

/**
 * C.5: confetti sutil (verde y morado, 1.2s) al cerrar un grupo G
 * completo -- solo al 100%, y solo una vez por grupo (localStorage), no
 * en cada carga de la página mientras siga en 100%.
 */
export function GroupCompleteConfetti({ groupCode, complete }: { groupCode: string; complete: boolean }) {
  const [showing, setShowing] = useState(false);

  useEffect(() => {
    if (!complete) return;
    const key = `group-100:${groupCode}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const frame = requestAnimationFrame(() => setShowing(true));
    const timer = setTimeout(() => setShowing(false), 1200);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [complete, groupCode]);

  if (!showing) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <span
          key={i}
          className="animate-confetti absolute top-0 h-1.5 w-1.5 rounded-full"
          style={{
            left: `${(i * 8.3) % 100}%`,
            backgroundColor: COLORS[i % 2],
            animationDelay: `${(i % 5) * 60}ms`,
          }}
        />
      ))}
    </div>
  );
}
