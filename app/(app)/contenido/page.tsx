import { createDsClient } from "@/lib/supabase/ds";
import { addDays, mondayOf, today } from "@/lib/domain/dates";
import { ContentCard, type DsContentPiece, type DsContentVariant } from "@/components/contenido/ContentCard";
import { AddContentForm } from "@/components/contenido/AddContentForm";
import { IdeaBank } from "@/components/contenido/IdeaBank";
import { LaneNotesButton } from "@/components/carriles/LaneNotesButton";
import type { NoteDocument } from "@/lib/types";

export const dynamic = "force-dynamic";

const STAGE_LABEL: Record<Exclude<DsContentPiece["estado"], "idea">, string> = {
  guion: "Guion",
  grabado: "Grabado o diseñado",
  editado: "Editado",
  programado: "Programado",
  publicado: "Publicado",
};
const BOARD_STAGES = Object.keys(STAGE_LABEL) as Exclude<DsContentPiece["estado"], "idea">[];

/** Realineación 21/10 — Contenido: tablero (sin "idea"), banco de ideas por pilar, Estrategia. */
export default async function ContenidoPage() {
  const db = await createDsClient();
  const [piecesQ, variantsQ, infoQ] = await Promise.all([
    db
      .from("ds_content_pieces")
      .select("id,tema,formato,canales,estado,pilar,fecha_objetivo,guion_notas,link_publicado")
      .order("created_at", { ascending: false }),
    db.from("ds_content_variants").select("id,piece_id,channel,estado,published_at"),
    db.from("ds_lane_info").select("notes").eq("lane", "D").maybeSingle(),
  ]);
  const pieces = (piecesQ.data ?? []) as DsContentPiece[];
  const variants = (variantsQ.data ?? []) as DsContentVariant[];
  const variantsByPiece = new Map<string, DsContentVariant[]>();
  for (const v of variants) {
    variantsByPiece.set(v.piece_id, [...(variantsByPiece.get(v.piece_id) ?? []), v]);
  }

  // Misma ventana lunes-viernes que el resto del dashboard (ver getWeekData).
  const monday = mondayOf(today());
  const friday = addDays(monday, 4);
  const publishedPieceIds = new Set(
    variants.filter((v) => v.estado === "publicado" && v.published_at && v.published_at >= monday && v.published_at <= friday).map((v) => v.piece_id),
  );
  const publishedThisWeek = publishedPieceIds.size;

  const ideaPieces = pieces.filter((p) => p.estado === "idea");
  const info = infoQ.data as { notes: NoteDocument | null } | null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-text">Contenido</h1>
          <p className="mt-1 text-sm text-text-muted">
            Esta semana: <span className="font-mono">{publishedThisWeek}/2</span> piezas
          </p>
        </div>
        <LaneNotesButton lane="D" title="Estrategia de Contenido" notes={info?.notes ?? null} />
      </div>

      <AddContentForm />

      <section className="hud-panel flex flex-col gap-3 p-4">
        <h2 className="hud-label">Banco de ideas</h2>
        <IdeaBank pieces={ideaPieces} variantsByPiece={variantsByPiece} />
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {BOARD_STAGES.map((stage) => {
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
                  rows.map((p) => <ContentCard key={p.id} piece={p} variants={variantsByPiece.get(p.id) ?? []} />)
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
