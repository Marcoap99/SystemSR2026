"use client";

import { useState, useTransition } from "react";
import { NotesModal } from "@/components/notes/NotesModal";
import {
  saveDsEvidenceNotesAction,
  setDsEvidenceLinkAction,
  setDsEvidenceStatusAction,
} from "@/lib/actions/ds";
import type { ItemStatus, NoteDocument } from "@/lib/types";

export interface DsEvidencePiece {
  id: string;
  title: string;
  kind: "caso_final" | "portafolio";
  url: string | null;
  status: ItemStatus;
  notes: NoteDocument | null;
  notes_word_count: number;
}

const STATUS_CYCLE: ItemStatus[] = ["pending", "in_progress", "done"];
const STATUS_LABEL: Record<ItemStatus, string> = { pending: "Pendiente", in_progress: "En curso", done: "Hecho" };
const STATUS_CLASSES: Record<ItemStatus, string> = {
  pending: "bg-badge-yellow-bg text-badge-yellow-text",
  in_progress: "bg-badge-blue-bg text-badge-blue-text",
  done: "bg-badge-green-bg text-badge-green-text",
};
const KIND_LABEL: Record<DsEvidencePiece["kind"], string> = { caso_final: "Caso final", portafolio: "Portafolio" };

/** Bloque 5 realineación — tarjeta de Evidencia, reusa NotesModal para el contenido. */
export function EvidenceCard({ piece }: { piece: DsEvidencePiece }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(piece.status);
  const [url, setUrl] = useState(piece.url ?? "");
  const [pending, startTransition] = useTransition();

  function cycleStatus() {
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(status) + 1) % STATUS_CYCLE.length]!;
    setStatus(next);
    startTransition(() => setDsEvidenceStatusAction(piece.id, next));
  }

  return (
    <>
      <div className="flex flex-col gap-2 rounded-card border border-border bg-bg p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-mono text-xs text-text-muted">{KIND_LABEL[piece.kind]}</p>
            <p className="text-sm font-medium text-text">{piece.title}</p>
          </div>
          <button
            type="button"
            onClick={cycleStatus}
            className={`shrink-0 rounded-badge px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[status]}`}
          >
            {STATUS_LABEL[status]}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={() => startTransition(() => setDsEvidenceLinkAction(piece.id, url))}
            placeholder="Link publicado"
            className="min-w-0 flex-1 rounded-card border border-border px-2 py-1 text-xs text-text"
          />
          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={pending}
            className="shrink-0 rounded-card border border-border px-2 py-1 text-xs text-dim-exponer hover:border-dim-exponer disabled:opacity-60"
          >
            {piece.notes_word_count > 0 ? `📝 Notas · ${piece.notes_word_count}` : "Escribir"}
          </button>
        </div>
      </div>

      {open ? (
        <NotesModal
          resource={{ id: piece.id, title: piece.title, url: piece.url, notes: piece.notes, status }}
          locked={false}
          onClose={() => setOpen(false)}
          saveNotes={saveDsEvidenceNotesAction}
          onStatusChange={setDsEvidenceStatusAction}
        />
      ) : null}
    </>
  );
}
