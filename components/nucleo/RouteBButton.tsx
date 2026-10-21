"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { addRouteBActionAction } from "@/lib/actions/ds";

export interface RouteBStrategy {
  code: string;
  name: string;
}

/**
 * "Estructura por carril" (21/10) -- antes el 0/5 de Ruta B no se podía
 * mover: nada escribía ahí. `strategies` vacío (Núcleo): solo descripción.
 * Con estrategias (Carril A): además elegís cuál.
 */
export function RouteBButton({ strategies = [] }: { strategies?: RouteBStrategy[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    const description = String(data.get("description") ?? "");
    const strategyCode = String(data.get("strategyCode") ?? "");
    startTransition(async () => {
      try {
        await addRouteBActionAction(description, strategyCode || undefined);
        formRef.current?.reset();
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo registrar");
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-card border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-2"
      >
        + Registrar acción (Ruta B)
      </button>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2 rounded-card border border-border bg-surface p-3">
      {strategies.length > 0 ? (
        <select name="strategyCode" defaultValue="" className="min-h-11 rounded-card border border-border bg-bg px-2 text-sm text-text">
          <option value="">Sin estrategia</option>
          {strategies.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>
      ) : null}
      <input
        name="description"
        placeholder="Qué hiciste"
        required
        maxLength={200}
        className="min-w-[160px] flex-1 rounded-card border border-border bg-bg px-2 py-1.5 text-sm text-text"
      />
      <button type="submit" disabled={pending} className="min-h-11 rounded-card bg-brand px-4 text-sm font-semibold text-bg disabled:opacity-50">
        Registrar
      </button>
      <button type="button" onClick={() => setOpen(false)} className="rounded-card border border-border px-3 py-1.5 text-sm text-text-muted">
        Cancelar
      </button>
      {error ? <p role="alert" className="w-full text-sm text-warn">{error}</p> : null}
    </form>
  );
}
