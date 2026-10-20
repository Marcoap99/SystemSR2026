"use client";

import { useState, useTransition } from "react";
import { NotesModal } from "@/components/notes/NotesModal";
import { saveDsContentNotesAction, setDsContentLinkAction, setDsContentStageAction, type DsContentStage } from "@/lib/actions/ds";
import type { NoteDocument } from "@/lib/types";

export interface DsContentPiece {
  id: string;
  tema: string;
  formato: string | null;
  canales: string[];
  estado: DsContentStage;
  fecha_objetivo: string | null;
  guion_notas: NoteDocument | null;
  link_publicado: string | null;
}

const STAGES: DsContentStage[] = ["idea", "guion", "grabado", "editado", "programado", "publicado"];

/** Bloque 6 realineación — tarjeta del tablero de Contenido. */
export function ContentCard({ piece }: { piece: DsContentPiece }) {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState(piece.link_publicado ?? "");
  const [pending, startTransition] = useTransition();

  const idx = STAGES.indexOf(piece.estado);
  const next = STAGES[idx + 1];

  return (
    <>
      <div className="flex flex-col gap-2 rounded-card border border-border bg-bg p-3">
        <p className="text-sm font-medium text-text">{piece.tema}</p>
        <p className="font-mono text-xs text-text-muted">
          {[piece.formato, ...piece.canales, piece.fecha_objetivo].filter(Boolean).join(" · ")}
        </p>

        {piece.estado === "programado" || piece.estado === "publicado" ? (
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onBlur={() => startTransition(() => setDsContentLinkAction(piece.id, link))}
            placeholder="Link publicado"
            className="rounded-card border border-border px-2 py-1 text-xs text-text"
          />
        ) : null}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-card border border-border px-2 py-1 text-xs text-text-muted hover:border-brand"
          >
            Guion
          </button>
          {next ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(() => setDsContentStageAction(piece.id, next))}
              className="rounded-card border border-border px-2 py-1 text-xs text-dim-aprender hover:border-dim-aprender disabled:opacity-60"
            >
              Pasar a {next} →
            </button>
          ) : null}
        </div>
      </div>

      {open ? (
        <NotesModal
          resource={{ id: piece.id, title: piece.tema, url: piece.link_publicado, notes: piece.guion_notas, status: "pending" }}
          locked={false}
          showStatus={false}
          onClose={() => setOpen(false)}
          saveNotes={saveDsContentNotesAction}
        />
      ) : null}
    </>
  );
}
