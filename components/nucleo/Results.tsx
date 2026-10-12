"use client";

import { useState, useTransition } from "react";
import { addDsResultAction, toggleDsTaskAction } from "@/lib/actions/ds";
import { LANE_COLOR, dayResults, type DsTask, type Lane } from "@/lib/domain/ds";

export function Results({ tasks }: { tasks: DsTask[] }) {
  const [pending, start] = useTransition();
  const [title, setTitle] = useState("");
  const [lane, setLane] = useState<Lane>("A");
  const [error, setError] = useState<string | null>(null);
  const rows = dayResults(tasks);

  function add() {
    setError(null);
    start(async () => {
      try {
        await addDsResultAction(lane, title);
        setTitle("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo agregar");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {rows.map(({ n, task }) => (
          <li key={task.id} className="flex items-center gap-3 rounded-card border border-border bg-surface-2 px-3 py-2">
            <span className="font-mono text-xs text-text-muted">{n}</span>
            <button
              type="button"
              disabled={pending}
              aria-pressed={task.status === "done"}
              aria-label={`Marcar ${n}: ${task.title}`}
              onClick={() => start(() => toggleDsTaskAction(task.id, task.status !== "done"))}
              className="grid h-11 w-11 shrink-0 place-items-center"
            >
              <span
                className="grid h-6 w-6 place-items-center rounded-md border-2"
                style={{ borderColor: LANE_COLOR[task.lane], background: task.status === "done" ? LANE_COLOR[task.lane] : "transparent" }}
              >
                {task.status === "done" ? <span className="text-xs font-bold text-bg">✓</span> : null}
              </span>
            </button>
            <span className={task.status === "done" ? "text-text-muted line-through" : "text-text"}>{task.title}</span>
          </li>
        ))}
        {rows.length === 0 ? <li className="text-sm text-text-muted">Sin resultados hoy. Define hasta 3.</li> : null}
      </ul>
      {rows.length < 3 ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
          className="flex gap-2"
        >
          <label className="sr-only" htmlFor="ds-lane">Carril</label>
          <select id="ds-lane" value={lane} onChange={(e) => setLane(e.target.value as Lane)} className="min-h-11 rounded-card border border-border bg-surface px-2 text-sm">
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
          <label className="sr-only" htmlFor="ds-title">Nuevo resultado</label>
          <input id="ds-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={140} placeholder="Nuevo resultado" className="min-h-11 min-w-0 flex-1 rounded-card border border-border bg-surface px-3 text-sm outline-none focus:border-brand" />
          <button type="submit" disabled={pending || !title.trim()} className="min-h-11 rounded-card bg-brand px-4 text-sm font-semibold text-bg disabled:opacity-50">
            Agregar
          </button>
        </form>
      ) : null}
      {error ? <p role="alert" className="text-sm text-warn">{error}</p> : null}
    </div>
  );
}
