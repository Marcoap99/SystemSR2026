"use client";

import { useTransition } from "react";
import { logHabitAction } from "@/lib/actions/ds";

export function HabitToggle({ habit, label, detail, on }: { habit: "english" | "sql"; label: string; detail: string; on: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={on}
      onClick={() => start(() => logHabitAction(habit, !on))}
      className={`flex min-h-14 items-center gap-3 rounded-card border px-4 text-left ${on ? "border-brand bg-brand/10" : "border-border bg-surface"}`}
    >
      <span className={`grid h-6 w-6 place-items-center rounded-md border-2 ${on ? "border-brand bg-brand text-bg" : "border-text-muted"}`}>{on ? "✓" : ""}</span>
      <span>
        <span className="block text-text">{label}</span>
        <span className="block font-mono text-xs text-text-muted">{detail}</span>
      </span>
    </button>
  );
}
