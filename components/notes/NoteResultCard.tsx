"use client";

import { useState } from "react";
import { NotesModal } from "@/components/notes/NotesModal";
import { relativeDaysEs } from "@/lib/domain/dates";
import type { Resource } from "@/lib/types";

function defaultExcerpt(plain: string): string {
  const lines = plain.split("\n").filter((l) => l.trim() !== "");
  const joined = lines.slice(0, 2).join(" — ");
  return joined.length > 140 ? joined.slice(0, 140).trim() + "…" : joined;
}

function excerptAround(text: string, index: number, radius = 70): string {
  if (index === -1) return defaultExcerpt(text);
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + radius);
  return (start > 0 ? "…" : "") + text.slice(start, end).trim() + (end < text.length ? "…" : "");
}

function Highlighted({ text, term }: { text: string; term?: string }) {
  if (!term) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-badge bg-brand/25 text-text">{text.slice(idx, idx + term.length)}</mark>
      {text.slice(idx + term.length)}
    </>
  );
}

/**
 * V1.3 parche sección 7 — tarjeta de resultado en /notas (por semana,
 * por tema o búsqueda). Click abre el mismo NotesModal del punto 2.
 */
export function NoteResultCard({
  resource,
  todayISO,
  searchTerm,
  matchIndex,
}: {
  resource: Resource;
  todayISO: string;
  searchTerm?: string;
  matchIndex?: number;
}) {
  const [open, setOpen] = useState(false);
  const plain = resource.notes_plain ?? "";
  const excerpt = searchTerm ? excerptAround(plain, matchIndex ?? -1) : defaultExcerpt(plain);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full flex-col gap-1 rounded-card border border-border bg-bg p-3 text-left transition-colors hover:border-brand/40"
      >
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-xs text-text-muted">
            {resource.learn_code}
            {resource.week ? ` · sem ${resource.week}` : ""}
          </p>
          <p className="shrink-0 text-xs text-text-muted">
            {resource.notes_updated_at ? relativeDaysEs(resource.notes_updated_at.slice(0, 10), todayISO) : ""}
          </p>
        </div>
        <p className="text-sm font-medium text-text">{resource.title}</p>
        {excerpt ? (
          <p className="line-clamp-2 text-xs text-text-muted">
            <Highlighted text={excerpt} term={searchTerm} />
          </p>
        ) : null}
        <p className="text-xs text-text-muted">
          📝 <span className="font-mono tabular-nums">{resource.notes_word_count}</span> palabras
        </p>
      </button>

      {open ? <NotesModal resource={resource} locked={false} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
