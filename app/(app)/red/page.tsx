import Link from "next/link";
import { createDsClient } from "@/lib/supabase/ds";
import { ConnectionCard, type DsConnection } from "@/components/red/ConnectionCard";
import { AddConnectionForm } from "@/components/red/AddConnectionForm";

export const dynamic = "force-dynamic";

const STAGE_LABEL: Record<DsConnection["etapa"], string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  conversando: "Conversando",
  reunion: "Reunión",
  cerrado: "Cerrado",
};
const STAGES = Object.keys(STAGE_LABEL) as DsConnection["etapa"][];

/** Bloque 5 realineación — Red: embudo de contactos (ds_connections). */
export default async function RedPage() {
  const db = await createDsClient();
  const { data } = await db
    .from("ds_connections")
    .select("id,persona,empresa,rol,canal,etapa,ultimo_contacto,proxima_accion,nota")
    .order("created_at", { ascending: false });
  const connections = (data ?? []) as DsConnection[];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-text">Red</h1>
          <p className="mt-1 text-sm text-text-muted">Contactos de esta temporada, por etapa.</p>
        </div>
        <Link href="/conectar" className="text-sm text-brand hover:underline">
          Ver Temporada 1 (archivo) →
        </Link>
      </div>

      <AddConnectionForm />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {STAGES.map((stage) => {
          const rows = connections.filter((c) => c.etapa === stage);
          return (
            <section key={stage} className="hud-panel flex flex-col gap-2 p-3">
              <h2 className="hud-label">
                {STAGE_LABEL[stage]} <span className="font-mono">({rows.length})</span>
              </h2>
              <div className="flex flex-col gap-2">
                {rows.length === 0 ? (
                  <p className="text-xs text-text-muted">Nada acá.</p>
                ) : (
                  rows.map((c) => <ConnectionCard key={c.id} connection={c} />)
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
