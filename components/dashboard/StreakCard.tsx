"use client";

import { useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { freezeStreakAction, markStreakAction } from "@/lib/actions/streaks";
import { today } from "@/lib/domain/dates";
import { getDisplayState, type StreakKind, type StreakState } from "@/lib/domain/streaks";
import type { Streak } from "@/lib/types";
import { NewLogEntryModal } from "./NewLogEntryModal";

const LABELS: Record<StreakKind, string> = {
  daily_english: "Inglés diario",
  weekly_log: "Log semanal",
};

function toState(row: Streak): StreakState {
  return {
    current: row.current,
    longest: row.longest,
    lastMarked: row.last_marked,
    freezesTotal: row.freezes_total,
    freezesUsed: row.freezes_used,
    quarter: row.quarter,
  };
}

/** 7.1 (4): número grande, estado (ok/warn), freezes como copos, acción de marcar. */
export function StreakCard({ kind, streak }: { kind: StreakKind; streak: Streak | undefined }) {
  const [pending, startTransition] = useTransition();
  const todayISO = today();

  const state = streak ? toState(streak) : null;
  const display = state
    ? getDisplayState(state, kind, todayISO)
    : { current: 0, status: "ok" as const };
  const freezesTotal = state?.freezesTotal ?? 2;
  const freezesAvailable = state ? state.freezesTotal - state.freezesUsed : freezesTotal;
  const canFreeze = display.status === "warn" && freezesAvailable > 0;

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-muted">{LABELS[kind]}</p>
          <div className="mt-1 flex items-center gap-1.5">
            {/* C.6: fuego en vez de un número pelado, opacidad ~ largo de la racha. */}
            <span
              aria-hidden="true"
              style={{ opacity: display.current === 0 ? 0.25 : Math.min(1, 0.35 + display.current / 30) }}
            >
              🔥
            </span>
            <p className="font-mono text-3xl font-bold text-text tabular-nums">{display.current}</p>
          </div>
        </div>
        <span
          className={
            "rounded-badge px-2 py-0.5 text-xs font-medium " +
            (display.status === "warn"
              ? "bg-warn/15 text-warn"
              : "bg-badge-green-bg text-badge-green-text")
          }
        >
          {display.status === "warn" ? "No falles mañana" : "Al día"}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1 text-base" aria-label="Freezes disponibles este trimestre">
        {Array.from({ length: freezesTotal }).map((_, i) => (
          <span key={i} className={i < freezesAvailable ? "text-brand" : "text-border"} aria-hidden="true">
            ❄
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {kind === "daily_english" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => markStreakAction(kind))}
            className="rounded-card bg-brand px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
          >
            Marcar hoy
          </button>
        ) : (
          // 6.2: weekly_log se marca automáticamente al crear un log_entry
          // de la semana en curso — no hay un "marcar" suelto sin evidencia.
          <NewLogEntryModal triggerLabel="Nueva entrada" />
        )}

        {canFreeze ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => freezeStreakAction(kind))}
            className="rounded-card border border-border px-3 py-1.5 text-sm font-medium text-text-muted hover:bg-bg disabled:opacity-60"
          >
            Usar freeze
          </button>
        ) : null}
      </div>
    </Card>
  );
}
