"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Orb } from "@/components/nucleo/Orb";
import { LANE_TARGET_H, type Lane } from "@/lib/domain/ds";

// Three.js (~150 KB gz) solo se descarga en el cliente y solo para el Núcleo.
const JarvisOrb3D = dynamic(() => import("@/components/nucleo/JarvisOrb3D").then((m) => m.JarvisOrb3D), {
  ssr: false,
  loading: () => <div className="h-full w-full" aria-hidden="true" />,
});

/** Orbe 3D con respaldo SVG (reduced-motion, WebGL por software o sin WebGL). */
export function OrbStage({ hours, label }: { hours: Record<Lane, number>; label: string }) {
  const [flat, setFlat] = useState(false);
  const total = Math.round((hours.A + hours.B + hours.C) * 10) / 10;
  const summary = (["A", "B", "C", "D"] as Lane[]).map((l) => `Carril ${l}: ${hours[l]} de ${LANE_TARGET_H[l]} horas`).join(". ");

  if (flat) return <Orb hours={hours} label={label} />;
  return (
    <div role="img" aria-label={`${label}. ${summary}`} className="relative mx-auto aspect-square w-full max-w-[360px]">
      <JarvisOrb3D hours={hours} onFallback={() => setFlat(true)} />
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-[.14em] text-text-muted">{label}</p>
          <p className="font-mono text-3xl font-semibold text-text">{total} h</p>
        </div>
      </div>
    </div>
  );
}
