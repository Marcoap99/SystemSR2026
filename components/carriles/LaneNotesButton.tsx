"use client";

import { useState } from "react";
import { NotesModal } from "@/components/notes/NotesModal";
import { saveDsLaneNotesAction } from "@/lib/actions/ds";
import type { Lane } from "@/lib/domain/ds";
import type { NoteDocument } from "@/lib/types";

/** Carril B/D — botón que abre el editor genérico sobre las notas largas del carril (ds_lane_info). */
export function LaneNotesButton({ lane, title, notes }: { lane: Lane; title: string; notes: NoteDocument | null }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-card border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-2"
      >
        {notes ? "Editar notas" : "+ Agregar notas"}
      </button>
      {open ? (
        <NotesModal
          resource={{ id: lane, title, url: null, notes, status: "pending" }}
          locked={false}
          showStatus={false}
          onClose={() => setOpen(false)}
          saveNotes={(_id, doc) => saveDsLaneNotesAction(lane, doc)}
        />
      ) : null}
    </>
  );
}
