"use client";

import { useState } from "react";
import { NotesModal, type NotesModalItem } from "@/components/notes/NotesModal";
import { saveDsResourceNotesAction, setDsResourceStatusAction } from "@/lib/actions/ds";

/** Bloque 1 realineación — botón "Notas" para un ds_resource, reusa NotesModal tal cual. */
export function DsResourceNotes({ resource }: { resource: NotesModalItem & { notes_word_count: number } }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="grid min-h-11 place-items-center rounded-card border border-border px-3 text-sm text-dim-aprender hover:border-dim-aprender"
      >
        {resource.notes_word_count > 0 ? `📝 Notas · ${resource.notes_word_count}` : "Notas"}
      </button>
      {open ? (
        <NotesModal
          resource={resource}
          locked={false}
          onClose={() => setOpen(false)}
          saveNotes={saveDsResourceNotesAction}
          onStatusChange={setDsResourceStatusAction}
        />
      ) : null}
    </>
  );
}
