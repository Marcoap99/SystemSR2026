"use client";

import { useState, useTransition } from "react";
import { logHoursAction } from "@/lib/actions/ds";
import { LANE_COLOR, LANE_NAME, LANE_TARGET_H, type Lane } from "@/lib/domain/ds";

/**
 * Feedback de Marco: los botones se sentían lentos. Dos causas: 1)
 * logHoursAction hacía lectura + escritura (2 viajes) -- ahora es un RPC
 * atómico de un solo viaje (increment_hours_log). 2) no había feedback
 * optimista -- el número solo cambiaba después de que volviera el
 * server action. Cada fila actualiza su propio número al toque del
 * click, sin esperar la red, y se corrige con el valor real cuando
 * responde (o se revierte si falla). No se deshabilita mientras está
 * pendiente: el RPC es atómico, varios clicks seguidos sobre el mismo
 * carril suman bien igual aunque las respuestas lleguen desordenadas.
 */
function HourRow({ lane, initialHours }: { lane: Lane; initialHours: number }) {
  const [hours, setHours] = useState(initialHours);
  const [, start] = useTransition();

  function bump(delta: number) {
    const prev = hours;
    setHours(Math.max(0, Math.round((prev + delta) * 10) / 10));
    start(async () => {
      try {
        const real = await logHoursAction(lane, delta);
        setHours(real);
      } catch {
        setHours(prev);
      }
    });
  }

  return (
    <li className="flex min-w-0 items-center gap-2 text-sm">
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: LANE_COLOR[lane] }} />
      <span className="min-w-0 flex-1 text-text">
        {lane} {LANE_NAME[lane]} · <span className="font-mono">{hours}/{LANE_TARGET_H[lane]} h</span>
      </span>
      <button
        type="button"
        aria-label={`Restar media hora a ${lane}`}
        onClick={() => bump(-0.5)}
        className="min-h-11 min-w-11 rounded-card border border-border text-text-muted hover:border-brand active:scale-95"
      >
        −
      </button>
      <button
        type="button"
        aria-label={`Sumar media hora a ${lane}`}
        onClick={() => bump(0.5)}
        className="min-h-11 rounded-card border border-border px-3 font-mono text-xs text-text hover:border-brand active:scale-95"
      >
        +0.5 h
      </button>
    </li>
  );
}

export function HoursButtons({ hours }: { hours: Record<Lane, number> }) {
  return (
    <ul className="flex flex-col gap-2">
      {(["A", "B", "C", "D"] as Lane[]).map((l) => (
        <HourRow key={l} lane={l} initialHours={hours[l]} />
      ))}
    </ul>
  );
}
