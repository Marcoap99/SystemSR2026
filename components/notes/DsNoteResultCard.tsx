"use client";

import { useState } from "react";
import { NotesModal } from "@/components/notes/NotesModal";
import { saveDsResourceNotesAction, setDsResourceStatusAction } from "@/lib/actions/ds";
import { relativeDaysEs } from "@/lib/domain/dates";
import type { DsNoteItem } from "@/lib/data/ds-notes";

function excerpt(plain: string): string {
  const lines = plain.split("\n").filter((l) => l.trim() !== "");
  const joined = lines.slice(0, 2).join(" — ");
  return joined.length > 140 ? joined.slice(0, 140).trim() + "…" : joined;
}

/** Bloque 2 realineación — tarjeta de nota de ds_resources, análoga a NoteResultCard. */
export function DsNoteResultCard({ item, todayISO }: { item: DsNoteItem; todayISO: string }) {
  const [open, setOpen] = useState(false);
  const plain = item.notesPlain ?? "";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full flex-col gap-1 rounded-card border border-border bg-bg p-3 text-left transition-colors hover:border-brand/40"
      >
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-xs text-text-muted">
            {item.themeCode}
            {item.week ? ` · sem ${item.week}` : ""}
          </p>
          <p className="shrink-0 text-xs text-text-muted">
            {item.notesUpdatedAt ? relativeDaysEs(item.notesUpdatedAt.slice(0, 10), todayISO) : ""}
          </p>
        </div>
        <p className="text-sm font-medium text-text">{item.title}</p>
        {plain ? <p className="line-clamp-2 text-xs text-text-muted">{excerpt(plain)}</p> : null}
        <p className="text-xs text-text-muted">
          📝 <span className="font-mono tabular-nums">{item.notesWordCount}</span> palabras
        </p>
      </button>

      {open ? (
        <NotesModal
          resource={item}
          locked={false}
          onClose={() => setOpen(false)}
          saveNotes={saveDsResourceNotesAction}
          onStatusChange={setDsResourceStatusAction}
        />
      ) : null}
    </>
  );
}
