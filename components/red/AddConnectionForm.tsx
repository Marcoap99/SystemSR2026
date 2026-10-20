"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { addDsConnectionAction } from "@/lib/actions/ds";

/** Bloque 5 realineación — alta rápida de un contacto en Red. */
export function AddConnectionForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const persona = String(data.get("persona") ?? "");
    if (!persona.trim()) return;
    startTransition(async () => {
      await addDsConnectionAction({
        persona,
        empresa: String(data.get("empresa") ?? ""),
        rol: String(data.get("rol") ?? ""),
        canal: String(data.get("canal") ?? ""),
      });
      formRef.current?.reset();
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-card border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-2"
      >
        + Nuevo contacto
      </button>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2 rounded-card border border-border bg-surface p-3">
      <input name="persona" placeholder="Nombre" required className="rounded-card border border-border px-2 py-1.5 text-sm text-text" />
      <input name="empresa" placeholder="Empresa" className="rounded-card border border-border px-2 py-1.5 text-sm text-text" />
      <input name="rol" placeholder="Rol" className="rounded-card border border-border px-2 py-1.5 text-sm text-text" />
      <input name="canal" placeholder="Canal" className="rounded-card border border-border px-2 py-1.5 text-sm text-text" />
      <button type="submit" disabled={pending} className="rounded-card bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
        Agregar
      </button>
      <button type="button" onClick={() => setOpen(false)} className="rounded-card border border-border px-3 py-1.5 text-sm text-text-muted">
        Cancelar
      </button>
    </form>
  );
}
