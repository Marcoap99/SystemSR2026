"use client";

import { useState } from "react";
import { NotesModal } from "@/components/notes/NotesModal";
import type { Resource, ResourceFormat } from "@/lib/types";

const FORMAT_LABEL: Record<ResourceFormat, string> = {
  video: "Video",
  podcast: "Podcast",
  curso: "Curso",
  interactivo: "Interactivo",
  web: "Web",
  ppt: "PPT",
  app: "App",
  pdf: "PDF",
  docx: "DOCX",
  md: "MD",
  otro: "Otro",
};

/**
 * V1.4 parche sección 2 — tarjeta de /enlaces. A diferencia de
 * ResourceCard (V1.1+), acá no hay tier/semana/track -- son conceptos
 * del plan que no aplican a un link suelto. El link externo se queda
 * en la tarjeta (no adentro del modal como en /aprender): acá el link
 * ES el contenido, no algo secundario a la nota.
 */
export function EnlaceCard({ resource }: { resource: Resource }) {
  const [open, setOpen] = useState(false);
  const hasNotes = resource.notes_word_count > 0;

  return (
    <>
      <div className="flex flex-col gap-2 rounded-card border border-border bg-bg p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-badge bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-text-muted">
            {FORMAT_LABEL[resource.format]}
          </span>
          {hasNotes ? (
            <span className="text-xs text-text-muted">
              📝 <span className="font-mono tabular-nums">{resource.notes_word_count}</span> palabras
            </span>
          ) : null}
        </div>

        <p className="text-sm font-medium text-text">{resource.title}</p>

        <div className="flex items-center justify-between gap-2">
          {resource.url ? (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand hover:underline"
            >
              🔗 Abrir link
            </a>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-card border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-2"
          >
            {hasNotes ? "Ver nota" : "Crear nota"}
          </button>
        </div>
      </div>

      {open ? <NotesModal resource={resource} locked={false} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
