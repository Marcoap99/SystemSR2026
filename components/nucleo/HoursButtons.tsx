"use client";

import { useTransition } from "react";
import { logHoursAction } from "@/lib/actions/ds";
import { LANE_COLOR, LANE_NAME, LANE_TARGET_H, type Lane } from "@/lib/domain/ds";

export function HoursButtons({ hours }: { hours: Record<Lane, number> }) {
  const [pending, start] = useTransition();
  return (
    <ul className="flex flex-col gap-2">
      {(["A", "B", "C"] as Lane[]).map((l) => (
        <li key={l} className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full" style={{ background: LANE_COLOR[l] }} />
          <span className="flex-1 text-text">
            {l} {LANE_NAME[l]} · <span className="font-mono">{hours[l]}/{LANE_TARGET_H[l]} h</span>
          </span>
          <button type="button" disabled={pending} aria-label={`Restar media hora a ${l}`} onClick={() => start(() => logHoursAction(l, -0.5))} className="min-h-11 min-w-11 rounded-card border border-border text-text-muted hover:border-brand">
            −
          </button>
          <button type="button" disabled={pending} aria-label={`Sumar media hora a ${l}`} onClick={() => start(() => logHoursAction(l, 0.5))} className="min-h-11 rounded-card border border-border px-3 font-mono text-xs text-text hover:border-brand">
            +0.5 h
          </button>
        </li>
      ))}
    </ul>
  );
}
