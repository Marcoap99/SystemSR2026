"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Card } from "@/components/ui/Card";
import { Seal } from "@/components/ui/Seal";
import { EarnedPulse } from "@/components/ui/EarnedPulse";
import { achieveResultAction } from "@/lib/actions/results";
import { today } from "@/lib/domain/dates";
import type { Result } from "@/lib/types";

/** 7.1 (6): fila de 6 círculos. Hover muestra el criterio. 6.4: marcar exige fecha + evidencia. */
export function Seals({ results }: { results: Result[] }) {
  const [target, setTarget] = useState<Result | null>(null);
  const [date, setDate] = useState(() => today());
  const [evidence, setEvidence] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openFor(result: Result) {
    if (result.achieved) return;
    setTarget(result);
    setDate(today());
    setEvidence("");
    setError(null);
  }

  function close() {
    if (pending) return;
    setTarget(null);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!target) return;
    setError(null);
    startTransition(async () => {
      try {
        await achieveResultAction(target.code, date, evidence);
        setTarget(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo guardar.");
      }
    });
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold text-text">Sellos</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {results.map((result) => (
          <EarnedPulse key={result.code} id={`seal:${result.code}`} earned={result.achieved}>
            {(justEarned) => (
              <button
                type="button"
                onClick={() => openFor(result)}
                className={result.achieved ? "cursor-default" : "cursor-pointer"}
                aria-label={`${result.code}: ${result.title}`}
              >
                <Seal
                  code={result.code}
                  achieved={result.achieved}
                  criterion={result.criterion}
                  className={justEarned ? "animate-badge-pop shadow-[0_0_16px_var(--color-brand-glow)]" : ""}
                />
              </button>
            )}
          </EarnedPulse>
        ))}
      </div>

      {target ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
          onClick={close}
        >
          <div
            className="w-full max-w-md rounded-card border border-border bg-surface p-6 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-text">
              {target.code} — {target.title}
            </h3>
            <p className="mt-1 text-sm text-text-muted">{target.criterion}</p>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-text">Fecha</span>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-card border border-border px-3 py-2 text-base text-text outline-none focus:border-secondary"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-text">Nota de evidencia</span>
                <textarea
                  required
                  rows={3}
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  className="rounded-card border border-border px-3 py-2 text-base text-text outline-none focus:border-secondary"
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
                  className="rounded-card bg-secondary px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                >
                  {pending ? "Guardando…" : "Marcar logrado"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
