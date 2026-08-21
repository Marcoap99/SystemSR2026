"use client";

import { useState, useTransition, type FormEvent } from "react";
import { createFreeResourceAction } from "@/lib/actions/resources";
import type { ResourceFormat } from "@/lib/types";

const FORMAT_OPTIONS: { value: ResourceFormat; label: string }[] = [
  { value: "web", label: "Web" },
  { value: "video", label: "Video" },
  { value: "podcast", label: "Podcast" },
  { value: "pdf", label: "PDF" },
  { value: "app", label: "Herramienta" },
  { value: "curso", label: "Curso" },
  { value: "otro", label: "Otro" },
];

/**
 * V1.4 parche sección 2 — alta de un enlace libre. Mismo patrón que
 * NewLogEntryModal (7.7): un formulario mínimo, guardar y cerrar.
 */
export function AddLinkModal() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<ResourceFormat>("web");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setTitle("");
    setUrl("");
    setFormat("web");
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
        await createFreeResourceAction(title, url || null, format);
        setOpen(false);
        reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo guardar el enlace.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-card bg-brand px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
      >
        + Agregar
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={close}>
          <div
            className="w-full max-w-md rounded-card border border-border bg-surface p-6 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-text">Guardar algo</h2>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-text">Título</span>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-card border border-border px-3 py-2 text-base text-text outline-none focus:border-brand"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-text">Link (opcional)</span>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://…"
                  className="rounded-card border border-border px-3 py-2 text-base text-text outline-none focus:border-brand"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-text">Formato</span>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as ResourceFormat)}
                  className="rounded-card border border-border px-3 py-2 text-base text-text outline-none focus:border-brand"
                >
                  {FORMAT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
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
    </>
  );
}
