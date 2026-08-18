"use client";

import { useState, useTransition, type FormEvent } from "react";
import { markConnectionDoneAction } from "@/lib/actions/connections";
import type { Connection } from "@/lib/types";

/** 7.4: al marcar `done`, exige llenar unlocked_note (qué desbloqueó realmente). */
export function ConnectionRow({ connection }: { connection: Connection }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function close() {
    if (pending) return;
    setOpen(false);
    setNote("");
    setError(null);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await markConnectionDoneAction(connection.code, note);
        setOpen(false);
        setNote("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo guardar.");
      }
    });
  }

  const done = connection.status === "done";

  return (
    <div className="rounded-card border border-border p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-text">
            <span className="font-mono">{connection.code}</span> — {connection.person}
          </p>
          {connection.role ? <p className="text-xs text-text-muted">{connection.role}</p> : null}
          <p className="mt-1 text-sm text-text-muted">{connection.unlocks}</p>
          <p className="mt-1 font-mono text-xs text-text-muted">{connection.target_month}</p>
        </div>

        <span
          className={
            "h-fit rounded-badge px-2 py-0.5 text-xs font-medium " +
            (done ? "bg-badge-green-bg text-badge-green-text" : "bg-badge-yellow-bg text-badge-yellow-text")
          }
        >
          {done ? "Hecho" : "Pendiente"}
        </span>
      </div>

      {done ? (
        connection.unlocked_note ? (
          <p className="mt-3 rounded-card bg-bg px-3 py-2 text-sm text-text">
            {connection.unlocked_note}
          </p>
        ) : null
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 rounded-card bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Marcar hecho
        </button>
      )}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
          onClick={close}
        >
          <div
            className="w-full max-w-md rounded-card border border-border bg-surface p-6 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-text">
              <span className="font-mono">{connection.code}</span> — {connection.person}
            </h3>
            <p className="mt-1 text-sm text-text-muted">
              ¿Qué desbloqueó realmente esta conexión?
            </p>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
              <textarea
                required
                autoFocus
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="rounded-card border border-border px-3 py-2 text-base text-text outline-none focus:border-brand"
              />

              {error ? <p className="text-sm text-warn">{error}</p> : null}

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={close}
                  className="rounded-card px-3 py-1.5 text-sm font-medium text-text-muted hover:bg-bg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-card bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
                >
                  {pending ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
