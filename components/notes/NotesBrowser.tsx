"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";
import { Card } from "@/components/ui/Card";
import { NoteResultCard } from "@/components/notes/NoteResultCard";
import { searchNotesAction, type NoteSearchResult } from "@/lib/actions/notes";
import type { NotesData } from "@/lib/data/notes";

type Tab = "semana" | "tema" | "busqueda";

const TABS: { value: Tab; label: string }[] = [
  { value: "semana", label: "Por semana" },
  { value: "tema", label: "Por tema" },
  { value: "busqueda", label: "🔍 Búsqueda" },
];

/** V1.3 parche sección 7 — /notas: las 3 vistas + búsqueda full-text. */
export function NotesBrowser({ data, todayISO }: { data: NotesData; todayISO: string }) {
  const [tab, setTab] = useState<Tab>("semana");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NoteSearchResult[] | null>(null);
  const [searched, setSearched] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    startTransition(async () => {
      const res = await searchNotesAction(q);
      setResults(res);
      setSearched(true);
    });
  }

  if (!data.hasAnyNotes) {
    return (
      <Card>
        <p className="text-sm text-text-muted">
          Todavía no hay notas. Empezá por un recurso de esta semana.
        </p>
        {/* LibraryBrowser ya arranca filtrado en "esta semana" cuando hay una activa -- no hace falta query param. */}
        <Link href="/aprender" className="mt-2 inline-block text-sm text-brand hover:underline">
          Ir a /aprender →
        </Link>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1 rounded-card border border-border bg-surface p-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={
              "rounded-badge px-3 py-1.5 text-sm font-medium transition-colors " +
              (tab === t.value ? "bg-brand/10 text-brand-dark" : "text-text-muted hover:bg-bg hover:text-text")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "semana" ? (
        <div className="flex flex-col gap-5">
          {data.byWeek.map((group) => (
            <Card key={group.week ?? "sin-semana"}>
              <h2 className="text-sm font-semibold text-text-muted">
                {group.week !== null ? `Semana ${group.week}` : "Sin semana asignada"}
              </h2>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {group.resources.map((r) => (
                  <NoteResultCard key={r.id} resource={r} todayISO={todayISO} />
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {tab === "tema" ? (
        <div className="flex flex-col gap-5">
          {data.byTopic.map((group) => (
            <Card key={group.learnCode}>
              <h2 className="text-sm font-semibold text-text-muted">
                <span className="font-mono">{group.learnCode}</span> — {group.learnTitle}
              </h2>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {group.resources.map((r) => (
                  <NoteResultCard key={r.id} resource={r} todayISO={todayISO} />
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {tab === "busqueda" ? (
        <Card>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en el contenido de tus notas…"
              className="flex-1 rounded-card border border-border px-3 py-2 text-sm text-text outline-none focus:border-brand"
            />
            <button
              type="submit"
              disabled={pending || query.trim() === ""}
              className="rounded-card bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {pending ? "Buscando…" : "Buscar"}
            </button>
          </form>

          {searched ? (
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(results ?? []).length === 0 ? (
                <p className="text-sm text-text-muted">Sin resultados para “{query}”.</p>
              ) : (
                (results ?? []).map(({ resource, matchIndex }) => (
                  <NoteResultCard
                    key={resource.id}
                    resource={resource}
                    todayISO={todayISO}
                    searchTerm={query.trim()}
                    matchIndex={matchIndex}
                  />
                ))
              )}
            </div>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
