"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { addDsEvidencePieceAction } from "@/lib/actions/ds";

/** Bloque 5 realineación — alta de una pieza de Evidencia. */
export function AddEvidenceForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = String(data.get("title") ?? "");
    if (!title.trim()) return;
    const kind = data.get("kind") === "caso_final" ? "caso_final" : "portafolio";
    startTransition(async () => {
      await addDsEvidencePieceAction({ title, kind });
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
        + Nueva pieza
      </button>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2 rounded-card border border-border bg-surface p-3">
      <input name="title" placeholder="Título" required className="min-w-[200px] flex-1 rounded-card border border-border px-2 py-1.5 text-sm text-text" />
      <select name="kind" defaultValue="portafolio" className="rounded-card border border-border px-2 py-1.5 text-sm text-text">
        <option value="portafolio">Portafolio</option>
        <option value="caso_final">Caso final</option>
      </select>
      <button type="submit" disabled={pending} className="rounded-card bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
        Agregar
      </button>
      <button type="button" onClick={() => setOpen(false)} className="rounded-card border border-border px-3 py-1.5 text-sm text-text-muted">
        Cancelar
      </button>
    </form>
  );
}
