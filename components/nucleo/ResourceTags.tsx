"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { addDsNoteTagAction, removeDsNoteTagAction } from "@/lib/actions/ds";

/** Realineación 20/10 (sección 1) — etiquetas por tema sobre un recurso (ds_note_tags). */
export function ResourceTags({ resourceId, tags }: { resourceId: string; tags: string[] }) {
  const [adding, setAdding] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const tag = String(new FormData(e.currentTarget).get("tag") ?? "").trim();
    if (!tag) return;
    startTransition(() => addDsNoteTagAction(resourceId, tag));
    formRef.current?.reset();
    setAdding(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => removeDsNoteTagAction(resourceId, tag))}
          title="Quitar etiqueta"
          className="rounded-badge bg-surface-2 px-1.5 py-0.5 text-[11px] font-mono text-text-muted hover:bg-warn/15 hover:text-warn disabled:opacity-60"
        >
          #{tag} ✕
        </button>
      ))}
      {adding ? (
        <form ref={formRef} onSubmit={handleAdd} className="flex items-center gap-1">
          <input
            name="tag"
            autoFocus
            placeholder="tema"
            onBlur={() => setAdding(false)}
            className="w-20 rounded-badge border border-border bg-bg px-1.5 py-0.5 text-[11px] text-text outline-none focus:border-brand"
          />
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-badge border border-dashed border-border px-1.5 py-0.5 text-[11px] text-text-muted hover:border-brand"
        >
          + etiqueta
        </button>
      )}
    </div>
  );
}
