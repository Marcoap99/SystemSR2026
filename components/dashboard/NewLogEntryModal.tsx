"use client";

import { useState, useTransition, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { createLogEntryAction } from "@/lib/actions/log";
import { today } from "@/lib/domain/dates";

/**
 * 7.7: 4 campos únicos (fecha, qué hice, qué prueba queda, código de
 * referencia opcional). Guardar y cerrar. Nada más — Guardrail P6.
 */
export function NewLogEntryModal({
  triggerLabel = "Nueva entrada",
  triggerClassName,
}: {
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(() => today());
  const [what, setWhat] = useState("");
  const [evidence, setEvidence] = useState("");
  const [refCode, setRefCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setDate(today());
    setWhat("");
    setEvidence("");
    setRefCode("");
    setError(null);
  }

  function close() {
    if (pending) return;
    setOpen(false);
    reset();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await createLogEntryAction({ date, what, evidence, ref_code: refCode || null });
        setOpen(false);
        reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo guardar la entrada.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          "rounded-card bg-brand px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        }
      >
        {triggerLabel}
      </button>

      {/* Portal a document.body: sin esto, `fixed` queda capturado por
          algún ancestro (PageTransition, o cualquier otro con transform
          activo en ese momento) y el modal termina renderizando por
          detrás de otros elementos en vez de arriba de todo, pese al
          z-50 -- el mismo bug que ya se había encontrado y arreglado en
          NotesModal (V1.3, AC14). */}
      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
              onClick={close}
            >
              <div
                className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-card border border-border bg-surface p-6 shadow-card"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-lg font-semibold text-text">Nueva entrada de log</h2>

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
                    <span className="font-medium text-text">Qué hice</span>
                    <textarea
                      required
                      rows={2}
                      value={what}
                      onChange={(e) => setWhat(e.target.value)}
                      className="rounded-card border border-border px-3 py-2 text-base text-text outline-none focus:border-brand"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-text">Qué prueba queda</span>
                    <textarea
                      required
                      rows={2}
                      value={evidence}
                      onChange={(e) => setEvidence(e.target.value)}
                      className="rounded-card border border-border px-3 py-2 text-base text-text outline-none focus:border-brand"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-text">Código de referencia (opcional)</span>
                    <input
                      value={refCode}
                      onChange={(e) => setRefCode(e.target.value)}
                      placeholder="G1.3, CN4, EX2…"
                      className="rounded-card border border-border px-3 py-2 text-base text-text outline-none focus:border-brand"
                    />
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
                      {pending ? "Guardando…" : "Guardar y cerrar"}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
