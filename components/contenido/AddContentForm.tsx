"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { addDsContentPieceAction, type ContentChannel, type ContentPilar } from "@/lib/actions/ds";

const CHANNELS: { value: ContentChannel; label: string }[] = [
  { value: "reel", label: "Reel" },
  { value: "tiktok", label: "TikTok" },
  { value: "carrusel_li", label: "Carrusel LI" },
];
const PILARES: { value: ContentPilar; label: string }[] = [
  { value: "producto", label: "Producto" },
  { value: "ecosistema", label: "Ecosistema" },
  { value: "ia", label: "IA" },
];

/** Realineación 21/10 — alta rápida de una idea de contenido, con canales y pilar fijos. */
export function AddContentForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [canales, setCanales] = useState<ContentChannel[]>([]);
  const [pilar, setPilar] = useState<ContentPilar | "">("");
  const formRef = useRef<HTMLFormElement>(null);

  function toggleChannel(c: ContentChannel) {
    setCanales((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const tema = String(data.get("tema") ?? "");
    if (!tema.trim()) return;
    startTransition(async () => {
      await addDsContentPieceAction({
        tema,
        formato: String(data.get("formato") ?? ""),
        canales,
        pilar: pilar || undefined,
      });
      formRef.current?.reset();
      setCanales([]);
      setPilar("");
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
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-card border border-border bg-surface p-3">
      <div className="flex flex-wrap items-end gap-2">
        <input name="tema" placeholder="Tema" required className="min-w-[200px] flex-1 rounded-card border border-border px-2 py-1.5 text-sm text-text" />
        <input name="formato" placeholder="Formato (video, post...)" className="rounded-card border border-border px-2 py-1.5 text-sm text-text" />
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
        <span>Canales:</span>
        {CHANNELS.map((c) => (
          <button
            type="button"
            key={c.value}
            onClick={() => toggleChannel(c.value)}
            className={`rounded-card border px-2 py-1 ${canales.includes(c.value) ? "border-brand text-brand" : "border-border text-text-muted"}`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
        <span>Pilar:</span>
        {PILARES.map((p) => (
          <button
            type="button"
            key={p.value}
            onClick={() => setPilar((prev) => (prev === p.value ? "" : p.value))}
            className={`rounded-card border px-2 py-1 ${pilar === p.value ? "border-brand text-brand" : "border-border text-text-muted"}`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="rounded-card bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
          Agregar
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-card border border-border px-3 py-1.5 text-sm text-text-muted">
          Cancelar
        </button>
      </div>
    </form>
  );
}
