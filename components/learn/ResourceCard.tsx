"use client";

import { useState, useTransition, type KeyboardEvent } from "react";
import { updateResourceStatusAction } from "@/lib/actions/resources";
import { NotesModal } from "@/components/notes/NotesModal";
import type { ItemStatus, Resource, ResourceFormat, ResourceLanguage, ResourceTier } from "@/lib/types";

const STATUS_CYCLE: ItemStatus[] = ["pending", "in_progress", "done"];
const STATUS_LABEL: Record<ItemStatus, string> = {
  pending: "Pendiente",
  in_progress: "En curso",
  done: "Hecho",
};
const STATUS_CLASSES: Record<ItemStatus, string> = {
  pending: "bg-badge-yellow-bg text-badge-yellow-text",
  in_progress: "bg-badge-blue-bg text-badge-blue-text",
  done: "bg-badge-green-bg text-badge-green-text",
};

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

const LANGUAGE_LABEL: Record<ResourceLanguage, string> = { es: "ES", en: "EN" };
const TIER_LABEL: Record<ResourceTier, string> = {
  nucleo: "Núcleo",
  utilitario: "Utilitario",
  archivo: "Archivo",
};

/**
 * Bloque A (V1.1) + V1.2 (lock por dependencia) + V1.3 (parche notas):
 * toda la tarjeta abre el bloc de notas -- el enlace externo se movió
 * adentro del modal (sección 6), así el click principal siempre es
 * "abrir mi espacio de trabajo", no "irme a otro sitio". El chip de
 * estado se queda afuera (como ya era) para poder cambiarlo sin abrir
 * el modal -- por eso la tarjeta no puede ser un <button> real (no se
 * puede anidar un botón dentro de otro), es un div con role="button".
 */
export function ResourceCard({ resource, locked = false }: { resource: Resource; locked?: boolean }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(resource.status);
  const [pending, startTransition] = useTransition();

  function cycleStatus() {
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(status) + 1) % STATUS_CYCLE.length]!;
    setStatus(next);
    startTransition(() => updateResourceStatusAction(resource.id, next));
  }

  function handleCardKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={handleCardKeyDown}
        className={
          "flex w-full cursor-pointer flex-col gap-2 rounded-card border border-border bg-bg p-3 text-left transition-colors hover:border-brand/40 " +
          (locked ? "opacity-60" : "")
        }
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text">{resource.title}</p>

            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-text-muted">
              <span className="rounded-badge bg-surface-2 px-1.5 py-0.5">{FORMAT_LABEL[resource.format]}</span>
              {resource.language ? (
                <span className="rounded-badge bg-surface-2 px-1.5 py-0.5">
                  {LANGUAGE_LABEL[resource.language]}
                </span>
              ) : null}
              {resource.duration_min ? (
                <span className="rounded-badge bg-surface-2 px-1.5 py-0.5">{resource.duration_min} min</span>
              ) : null}
              {resource.week ? (
                <span className="rounded-badge bg-surface-2 px-1.5 py-0.5">Semana {resource.week}</span>
              ) : null}
              {/* V1.4: tier es null solo para recursos libres, que /aprender ya no trae -- este guard es solo tipado. */}
              {resource.tier ? (
                <span className="rounded-badge bg-surface-2 px-1.5 py-0.5">{TIER_LABEL[resource.tier]}</span>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            disabled={pending || locked}
            onClick={(e) => {
              e.stopPropagation();
              cycleStatus();
            }}
            className={`shrink-0 rounded-badge px-2 py-0.5 text-xs font-medium transition-opacity disabled:opacity-60 ${STATUS_CLASSES[status]}`}
            title={locked ? "Bloqueado" : "Cambiar estado"}
          >
            {STATUS_LABEL[status]}
          </button>
        </div>

        {/* V1.3: la nota es la prueba (Regla 1) -- sin estado vacío ruidoso si no hay nada escrito todavía. */}
        {resource.notes_word_count > 0 ? (
          <p className="text-xs text-text-muted">
            📝 <span className="font-mono tabular-nums">{resource.notes_word_count}</span> palabras
          </p>
        ) : null}
      </div>

      {open ? <NotesModal resource={resource} locked={locked} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
