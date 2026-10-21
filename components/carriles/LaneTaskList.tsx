"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { addLaneTaskAction, setDsTaskStatusAction } from "@/lib/actions/ds";
import { LANE_COLOR, type Lane } from "@/lib/domain/ds";

export interface LaneTask {
  id: string;
  title: string;
  status: "pending" | "done" | "skipped";
  day: string | null;
}

function TaskRow({ task, lane }: { task: LaneTask; lane: Lane }) {
  const [pending, start] = useTransition();
  const done = task.status === "done";
  const skipped = task.status === "skipped";

  return (
    <li className="flex items-center gap-3 rounded-card border border-border bg-surface-2 px-3 py-2">
      <button
        type="button"
        disabled={pending}
        aria-pressed={done}
        aria-label={`Marcar como hecho: ${task.title}`}
        onClick={() => start(() => setDsTaskStatusAction(task.id, done ? "pending" : "done"))}
        className="grid h-11 w-11 shrink-0 place-items-center"
      >
        <span
          className="grid h-6 w-6 place-items-center rounded-md border-2"
          style={{ borderColor: LANE_COLOR[lane], background: done ? LANE_COLOR[lane] : "transparent" }}
        >
          {done ? <span className="text-xs font-bold text-bg">✓</span> : null}
        </span>
      </button>
      <span className={`min-w-0 flex-1 text-sm ${done || skipped ? "text-text-muted line-through" : "text-text"}`}>
        {task.title}
        {task.day ? <span className="ml-2 font-mono text-xs text-text-muted no-underline">({task.day})</span> : null}
      </span>
      {!done ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => start(() => setDsTaskStatusAction(task.id, skipped ? "pending" : "skipped"))}
          className="shrink-0 rounded-card border border-border px-2 py-1 text-xs text-text-muted hover:border-warn hover:text-warn disabled:opacity-60"
        >
          {skipped ? "Reactivar" : "Saltar"}
        </button>
      ) : null}
    </li>
  );
}

/** Realineación 21/10 — checklist de un carril (A/B), agrupable por estrategia/etapa. */
export function LaneTaskList({
  lane,
  tasks,
  strategyCode,
  placeholder = "Nueva acción para este carril",
}: {
  lane: Lane;
  tasks: LaneTask[];
  strategyCode?: string;
  placeholder?: string;
}) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const doneTasks = tasks.filter((t) => t.status === "done");
  const skippedTasks = tasks.filter((t) => t.status === "skipped");

  function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const title = String(new FormData(e.currentTarget).get("title") ?? "").trim();
    if (!title) return;
    startTransition(async () => {
      try {
        await addLaneTaskAction(lane, title, strategyCode);
        formRef.current?.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo agregar");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <form ref={formRef} onSubmit={handleAdd} className="flex flex-wrap gap-2">
        <input
          name="title"
          maxLength={140}
          placeholder={placeholder}
          className="min-h-11 min-w-[160px] flex-1 rounded-card border border-border bg-surface px-3 text-sm text-text outline-none focus:border-brand focus-visible:ring-2 focus-visible:ring-brand"
        />
        <button type="submit" disabled={pending} className="min-h-11 shrink-0 rounded-card bg-brand px-4 text-sm font-semibold text-bg disabled:opacity-50">
          Agregar
        </button>
      </form>
      {error ? <p role="alert" className="text-sm text-warn">{error}</p> : null}

      <div>
        <p className="hud-label">Pendientes ({pendingTasks.length})</p>
        <ul className="mt-2 flex flex-col gap-2">
          {pendingTasks.length === 0 ? <li className="text-sm text-text-muted">Nada pendiente.</li> : null}
          {pendingTasks.map((t) => (
            <TaskRow key={t.id} task={t} lane={lane} />
          ))}
        </ul>
      </div>

      {doneTasks.length > 0 ? (
        <div>
          <p className="hud-label">Hechas ({doneTasks.length})</p>
          <ul className="mt-2 flex flex-col gap-2">
            {doneTasks.map((t) => (
              <TaskRow key={t.id} task={t} lane={lane} />
            ))}
          </ul>
        </div>
      ) : null}

      {skippedTasks.length > 0 ? (
        <div>
          <p className="hud-label">Saltadas ({skippedTasks.length})</p>
          <ul className="mt-2 flex flex-col gap-2">
            {skippedTasks.map((t) => (
              <TaskRow key={t.id} task={t} lane={lane} />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
