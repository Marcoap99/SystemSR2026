import Link from "next/link";
import { createDsClient } from "@/lib/supabase/ds";
import { today } from "@/lib/domain/dates";
import { currentDsWeek, type DsWeek } from "@/lib/domain/ds";
import { AprenderTabs } from "@/components/nucleo/AprenderTabs";
import { ResourceCheck } from "@/components/nucleo/ResourceCheck";
import { DsResourceNotes } from "@/components/nucleo/DsResourceNotes";
import { ResourceTags } from "@/components/nucleo/ResourceTags";
import type { NoteDocument } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Res {
  id: string;
  theme_code: string;
  week: number | null;
  sort_order: number;
  title: string;
  url: string | null;
  format: string | null;
  language: string | null;
  duration_min: number | null;
  tier: "nucleo" | "utilitario" | "archivo";
  verified: string | null;
  status: "pending" | "in_progress" | "done";
  notes: NoteDocument | null;
  notes_word_count: number;
  has_notes: boolean;
}

export default async function RutaPage({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  const { s } = await searchParams;
  const db = await createDsClient();
  const [weeksQ, themesQ, resQ, tagsQ] = await Promise.all([
    db.from("ds_weeks").select("number,starts_on,ends_on").order("number"),
    db.from("ds_study_themes").select("code,title,piece"),
    db.from("ds_resources").select("*").order("sort_order"),
    db.from("ds_note_tags").select("resource_id,tag"),
  ]);
  const weeks = (weeksQ.data ?? []) as DsWeek[];
  const cur = currentDsWeek(today(), weeks)?.number ?? 1;
  const n = Math.min(10, Math.max(1, Number(s) || cur));
  const themes = new Map(((themesQ.data ?? []) as { code: string; title: string; piece: string | null }[]).map((t) => [t.code, t]));
  const rows = ((resQ.data ?? []) as Res[]).filter((r) => r.week === n && r.theme_code !== "SQL" && r.theme_code !== "ING");
  const codes = [...new Set(rows.map((r) => r.theme_code))];
  const tagsByResource = new Map<string, string[]>();
  for (const t of (tagsQ.data ?? []) as { resource_id: string; tag: string }[]) {
    tagsByResource.set(t.resource_id, [...(tagsByResource.get(t.resource_id) ?? []), t.tag]);
  }

  return (
    <div className="flex flex-col gap-4">
      <AprenderTabs active="/ruta" />
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-text">Ruta de la semana</h1>
        <nav aria-label="Semanas" className="flex flex-wrap gap-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((w) => (
            <Link
              key={w}
              href={`/ruta?s=${w}`}
              aria-current={w === n ? "page" : undefined}
              className={`min-h-11 min-w-11 rounded-card px-3 py-2 text-center font-mono text-sm ${w === n ? "bg-dim-aprender/15 text-dim-aprender" : "text-text-muted hover:bg-surface-2"}`}
            >
              S{w}
            </Link>
          ))}
        </nav>
      </header>
      {codes.length === 0 ? <p className="text-sm text-text-muted">Semana de repaso y colchón: sin recursos nuevos.</p> : null}
      {codes.map((code) => {
        const t = themes.get(code);
        return (
          <section key={code} className="hud-panel p-4">
            <h2 className="font-semibold text-text">
              {code} · {t?.title ?? ""}
            </h2>
            <ul className="mt-2 flex flex-col">
              {rows
                .filter((r) => r.theme_code === code)
                // Primero lo que tiene notas o está en curso; después backlog
                // (pendiente sin notas) -- dentro de cada grupo, sort_order.
                .sort((a, b) => {
                  const weight = (r: Res) => (r.has_notes || r.status === "in_progress" ? 0 : 1);
                  return weight(a) - weight(b) || a.sort_order - b.sort_order;
                })
                .map((r) => (
                  <li key={r.id} className="flex items-center gap-2 border-t border-border first:border-t-0">
                    <ResourceCheck id={r.id} title={r.title} done={r.status === "done"} />
                    <div className="min-w-0 flex-1 py-2">
                      <p className={`text-sm ${r.status === "done" ? "text-text-muted line-through" : "text-text"}`}>{r.title}</p>
                      <p className="font-mono text-xs text-text-muted">
                        {r.tier === "nucleo" ? "NÚCLEO" : "UTILITARIO"} · {r.format} · {r.language} · {r.duration_min} min
                        {r.verified === "parcial" ? " · requiere login" : ""}
                      </p>
                      <div className="mt-1">
                        <ResourceTags resourceId={r.id} tags={tagsByResource.get(r.id) ?? []} />
                      </div>
                    </div>
                    <DsResourceNotes
                      resource={{
                        id: r.id,
                        title: r.title,
                        url: r.url,
                        tier: r.tier,
                        format: r.format,
                        language: r.language,
                        week: r.week,
                        notes: r.notes,
                        status: r.status,
                        notes_word_count: r.notes_word_count,
                      }}
                    />
                    {r.url ? (
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="grid min-h-11 place-items-center rounded-card border border-border px-3 text-sm text-dim-aprender hover:border-dim-aprender">
                        Abrir
                      </a>
                    ) : null}
                  </li>
                ))}
            </ul>
            {t?.piece ? (
              <p className="mt-3 text-sm text-text-muted">
                <span className="font-mono text-xs uppercase tracking-[.14em]">Pieza · </span>
                {t.piece}
              </p>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
