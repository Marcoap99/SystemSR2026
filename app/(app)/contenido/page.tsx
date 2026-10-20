import { createDsClient } from "@/lib/supabase/ds";
import { addDays, mondayOf, today } from "@/lib/domain/dates";
import { ContentCard, type DsContentPiece } from "@/components/contenido/ContentCard";
import { AddContentForm } from "@/components/contenido/AddContentForm";

export const dynamic = "force-dynamic";

const STAGE_LABEL: Record<DsContentPiece["estado"], string> = {
  idea: "Idea",
  guion: "Guion",
  grabado: "Grabado o diseñado",
  editado: "Editado",
  programado: "Programado",
  publicado: "Publicado",
};
const STAGES = Object.keys(STAGE_LABEL) as DsContentPiece["estado"][];

/** Bloque 6 realineación — Contenido: tablero por estado. */
export default async function ContenidoPage() {
  const db = await createDsClient();
  const { data } = await db
    .from("ds_content_pieces")
    .select("id,tema,formato,canales,estado,fecha_objetivo,guion_notas,link_publicado")
    .order("created_at", { ascending: false });
  const pieces = (data ?? []) as DsContentPiece[];

  const monday = mondayOf(today());
  const friday = addDays(monday, 4);
  const publishedThisWeek = pieces.filter(
    (p) => p.estado === "publicado" && p.fecha_objetivo && p.fecha_objetivo >= monday && p.fecha_objetivo <= friday,
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-text">Contenido</h1>
          <p className="mt-1 text-sm text-text-muted">
            Publicadas esta semana: <span className="font-mono">{publishedThisWeek}</span>
          </p>
        </div>
      </div>

      <AddContentForm />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {STAGES.map((stage) => {
          const rows = pieces.filter((p) => p.estado === stage);
          return (
            <section key={stage} className="hud-panel flex flex-col gap-2 p-3">
              <h2 className="hud-label">
                {STAGE_LABEL[stage]} <span className="font-mono">({rows.length})</span>
              </h2>
              <div className="flex flex-col gap-2">
                {rows.length === 0 ? (
                  <p className="text-xs text-text-muted">Nada acá.</p>
                ) : (
                  rows.map((p) => <ContentCard key={p.id} piece={p} />)
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
