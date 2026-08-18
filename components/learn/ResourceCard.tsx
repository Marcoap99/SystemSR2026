"use client";

import { useState, useTransition } from "react";
import { updateResourceNotesAction, updateResourceStatusAction } from "@/lib/actions/resources";
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

/** Bloque A: una tarjeta por recurso — chips, toggle de estado inline, notas expandibles. */
export function ResourceCard({ resource }: { resource: Resource }) {
  const [pending, startTransition] = useTransition();
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesValue, setNotesValue] = useState(resource.notes ?? "");

  function cycleStatus() {
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(resource.status) + 1) % STATUS_CYCLE.length]!;
    startTransition(() => updateResourceStatusAction(resource.id, next));
  }

  function saveNotes() {
    if (notesValue === (resource.notes ?? "")) return;
    startTransition(() => updateResourceNotesAction(resource.id, notesValue));
  }

  return (
    <div className="flex flex-col gap-2 rounded-card border border-border bg-bg p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {resource.url ? (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-text hover:text-brand hover:underline"
            >
              {resource.title}
            </a>
          ) : (
            <p className="text-sm font-medium text-text">{resource.title}</p>
          )}

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
            <span className="rounded-badge bg-surface-2 px-1.5 py-0.5">{TIER_LABEL[resource.tier]}</span>
          </div>
        </div>

        <button
          type="button"
          disabled={pending}
          onClick={cycleStatus}
          className={`shrink-0 rounded-badge px-2 py-0.5 text-xs font-medium transition-opacity disabled:opacity-60 ${STATUS_CLASSES[resource.status]}`}
          title="Cambiar estado"
        >
          {STATUS_LABEL[resource.status]}
        </button>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setNotesOpen((v) => !v)}
          className="text-xs text-text-muted hover:text-text"
        >
          {notesOpen ? "Ocultar notas" : resource.notes ? "Ver notas" : "+ Notas"}
        </button>
        {notesOpen ? (
          <textarea
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            onBlur={saveNotes}
            disabled={pending}
            placeholder="Nota personal sobre este recurso..."
            rows={2}
            className="mt-1.5 w-full rounded-card border border-border bg-surface p-2 text-xs text-text outline-none focus:border-brand disabled:opacity-60"
          />
        ) : null}
      </div>
    </div>
  );
}
