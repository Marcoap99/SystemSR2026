import { createDsClient } from "@/lib/supabase/ds";
import { EvidenceCard, type DsEvidencePiece } from "@/components/evidencia/EvidenceCard";
import { AddEvidenceForm } from "@/components/evidencia/AddEvidenceForm";

export const dynamic = "force-dynamic";

/** Bloque 5 realineación — Evidencia: caso final (1-7) + portafolio libre. */
export default async function EvidenciaPage() {
  const db = await createDsClient();
  const { data } = await db
    .from("ds_evidence_pieces")
    .select("id,title,kind,url,status,notes,notes_word_count")
    .order("sort_order");
  const pieces = (data ?? []) as DsEvidencePiece[];
  const casoFinal = pieces.filter((p) => p.kind === "caso_final");
  const portafolio = pieces.filter((p) => p.kind === "portafolio");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-text">Evidencia</h1>
        <p className="mt-1 text-sm text-text-muted">Caso final y portafolio libre.</p>
      </div>

      <AddEvidenceForm />

      <section className="hud-panel flex flex-col gap-2 p-4">
        <h2 className="hud-label">Caso final</h2>
        {casoFinal.length === 0 ? (
          <p className="text-sm text-text-muted">Todavía no hay piezas.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {casoFinal.map((p) => (
              <EvidenceCard key={p.id} piece={p} />
            ))}
          </div>
        )}
      </section>

      <section className="hud-panel flex flex-col gap-2 p-4">
        <h2 className="hud-label">Portafolio libre</h2>
        {portafolio.length === 0 ? (
          <p className="text-sm text-text-muted">Todavía no hay piezas.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {portafolio.map((p) => (
              <EvidenceCard key={p.id} piece={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
