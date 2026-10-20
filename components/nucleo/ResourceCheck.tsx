"use client";

import { useTransition } from "react";
import { setDsResourceStatusAction } from "@/lib/actions/ds";

export function ResourceCheck({ id, title, done }: { id: string; title: string; done: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={done}
      aria-label={`Marcar como hecho: ${title}`}
      onClick={() => start(() => setDsResourceStatusAction(id, done ? "pending" : "done"))}
      className="grid h-11 w-11 shrink-0 place-items-center"
    >
      <span
        className="grid h-6 w-6 place-items-center rounded-md border-2 border-dim-aprender"
        style={{ background: done ? "var(--color-dim-aprender)" : "transparent" }}
      >
        {done ? <span className="text-xs font-bold text-bg">✓</span> : null}
      </span>
    </button>
  );
}
