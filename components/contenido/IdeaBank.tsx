"use client";

import { useState } from "react";
import { ContentCard, type DsContentPiece, type DsContentVariant } from "@/components/contenido/ContentCard";
import type { ContentPilar } from "@/lib/actions/ds";

const PILAR_LABEL: Record<ContentPilar, string> = { producto: "Producto", ecosistema: "Ecosistema", ia: "IA" };
const PILARES = Object.keys(PILAR_LABEL) as ContentPilar[];

/** Realineación 21/10 — banco de ideas de Contenido, filtrable por pilar. */
export function IdeaBank({
  pieces,
  variantsByPiece,
}: {
  pieces: DsContentPiece[];
  variantsByPiece: Map<string, DsContentVariant[]>;
}) {
  const [filter, setFilter] = useState<ContentPilar | "todos">("todos");
  const filtered = filter === "todos" ? pieces : pieces.filter((p) => p.pilar === filter);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={() => setFilter("todos")}
          className={`rounded-card border px-2 py-1 ${filter === "todos" ? "border-brand text-brand" : "border-border text-text-muted"}`}
        >
          Todos
        </button>
        {PILARES.map((p) => (
          <button
            type="button"
            key={p}
            onClick={() => setFilter(p)}
            className={`rounded-card border px-2 py-1 ${filter === p ? "border-brand text-brand" : "border-border text-text-muted"}`}
          >
            {PILAR_LABEL[p]}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="text-xs text-text-muted">Sin ideas acá.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ContentCard key={p.id} piece={p} variants={variantsByPiece.get(p.id) ?? []} />
          ))}
        </div>
      )}
    </div>
  );
}
