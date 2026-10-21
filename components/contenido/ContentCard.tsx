"use client";

import { useState, useTransition } from "react";
import { NotesModal } from "@/components/notes/NotesModal";
import { today } from "@/lib/domain/dates";
import {
  saveDsContentNotesAction,
  setDsContentStageAction,
  setDsContentVariantDateAction,
  setDsContentVariantStageAction,
  type ContentChannel,
  type ContentPilar,
  type DsContentStage,
} from "@/lib/actions/ds";
import type { NoteDocument } from "@/lib/types";

export interface DsContentPiece {
  id: string;
  tema: string;
  formato: string | null;
  canales: string[];
  estado: DsContentStage;
  pilar: ContentPilar | null;
  fecha_objetivo: string | null;
  guion_notas: NoteDocument | null;
  link_publicado: string | null;
}

export interface DsContentVariant {
  id: string;
  piece_id: string;
  channel: ContentChannel;
  estado: DsContentStage;
  published_at: string | null;
}

const STAGES: DsContentStage[] = ["idea", "guion", "grabado", "editado", "programado", "publicado"];
const CHANNEL_LABEL: Record<ContentChannel, string> = { reel: "Reel", tiktok: "TikTok", carrusel_li: "Carrusel LI" };

function VariantRow({ variant }: { variant: DsContentVariant }) {
  const [estado, setEstado] = useState(variant.estado);
  const [date, setDate] = useState(variant.published_at ?? "");
  const [, startTransition] = useTransition();
  const idx = STAGES.indexOf(estado);
  const next = STAGES[idx + 1];

  function advance() {
    const target = next;
    if (!target) return;
    setEstado(target);
    if (target === "publicado" && !date) setDate(today());
    startTransition(() => setDsContentVariantStageAction(variant.id, target));
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-card border border-border bg-surface-2 px-2 py-1.5 text-xs">
      <span className="min-w-[70px] font-medium text-text">{CHANNEL_LABEL[variant.channel]}</span>
      <span className="font-mono text-text-muted">{estado}</span>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        onBlur={() => startTransition(() => setDsContentVariantDateAction(variant.id, date))}
        className="rounded-card border border-border bg-bg px-1.5 py-0.5 text-text"
      />
      {next ? (
        <button
          type="button"
          onClick={advance}
          className="ml-auto shrink-0 rounded-card border border-border px-2 py-0.5 text-dim-aprender hover:border-dim-aprender"
        >
          → {next}
        </button>
      ) : null}
    </div>
  );
}

/** Realineación 21/10 — tarjeta del tablero de Contenido, con variantes por canal. */
export function ContentCard({ piece, variants }: { piece: DsContentPiece; variants: DsContentVariant[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const idx = STAGES.indexOf(piece.estado);
  const next = STAGES[idx + 1];
  const publicada = variants.some((v) => v.estado === "publicado");

  return (
    <>
      <div className="flex flex-col gap-2 rounded-card border border-border bg-bg p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-text">{piece.tema}</p>
          {publicada ? <span className="shrink-0 rounded-badge bg-badge-green-bg px-1.5 py-0.5 text-xs text-badge-green-text">Publicada</span> : null}
        </div>
        <p className="font-mono text-xs text-text-muted">{[piece.formato, piece.pilar].filter(Boolean).join(" · ")}</p>

        {variants.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {variants.map((v) => (
              <VariantRow key={v.id} variant={v} />
            ))}
          </div>
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
