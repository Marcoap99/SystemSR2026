"use client";

import { useState, useTransition, type FormEvent } from "react";
import { addExposureEventAction } from "@/lib/actions/exposures";
import { today } from "@/lib/domain/dates";
import type { ExposureWithCount } from "@/lib/data/exponer";

/** 7.5 / P9 / 6.8: nunca "n/máximo". Si el mes ya llegó al cap, el botón se deshabilita. */
export function ExposureTypeCard({ item }: { item: ExposureWithCount }) {
  const { exposure } = item;
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(() => today());
  const [name, setName] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function close() {
    if (pending) return;
    setOpen(false);
    setDate(today());
    setName("");
    setOutput("");
    setError(null);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await addExposureEventAction({ exposureCode: exposure.code, date, name, output });
        setOpen(false);
        setDate(today());
        setName("");
        setOutput("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo guardar.");
      }
    });
  }

  return (
    <div className="rounded-card border border-border p-4">
      <p className="text-sm font-semibold text-text">
        <span className="font-mono">{exposure.code}</span> — {exposure.type}
      </p>
      <p className="mt-1 text-xs text-text-muted">Salida obligatoria: {exposure.required_output}</p>
      <p className="mt-3 font-mono text-sm font-medium text-text tabular-nums">{item.summaryText}</p>

      {item.capReached ? (
        <p className="mt-3 text-xs font-medium text-warn">Techo del mes alcanzado</p>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 rounded-card bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Agregar evento
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
              {exposure.code} — {exposure.type}
            </h3>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-text">Fecha</span>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-card border border-border px-3 py-2 text-base text-text outline-none focus:border-brand"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-text">Nombre del evento</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-card border border-border px-3 py-2 text-base text-text outline-none focus:border-brand"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-text">
                  Salida obligatoria <span className="text-warn">*</span>
                </span>
                <textarea
                  required
                  rows={2}
                  value={output}
                  onChange={(e) => setOutput(e.target.value)}
                  placeholder={exposure.required_output}
                  className="rounded-card border border-border px-3 py-2 text-base text-text outline-none focus:border-brand"
                />
                <span className="text-xs text-text-muted">
                  Si queda vacío, el evento no cuenta.
                </span>
              </label>

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
