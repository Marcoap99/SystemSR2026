"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { addDsContentPieceAction } from "@/lib/actions/ds";

/** Bloque 6 realineación — alta rápida de una idea de contenido. */
export function AddContentForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const tema = String(data.get("tema") ?? "");
    if (!tema.trim()) return;
    const canales = String(data.get("canales") ?? "")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    startTransition(async () => {
      await addDsContentPieceAction({ tema, formato: String(data.get("formato") ?? ""), canales });
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
        + Nueva idea
      </button>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2 rounded-card border border-border bg-surface p-3">
      <input name="tema" placeholder="Tema" required className="min-w-[200px] flex-1 rounded-card border border-border px-2 py-1.5 text-sm text-text" />
      <input name="formato" placeholder="Formato (video, post...)" className="rounded-card border border-border px-2 py-1.5 text-sm text-text" />
      <input name="canales" placeholder="Canales (separados por coma)" className="rounded-card border border-border px-2 py-1.5 text-sm text-text" />
      <button type="submit" disabled={pending} className="rounded-card bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
        Agregar
      </button>
      <button type="button" onClick={() => setOpen(false)} className="rounded-card border border-border px-3 py-1.5 text-sm text-text-muted">
        Cancelar
      </button>
    </form>
  );
}
