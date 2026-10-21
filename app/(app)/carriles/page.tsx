import Link from "next/link";
import { getWeekData } from "@/lib/data/ds-week";
import { LANE_COLOR, LANE_NAME, LANE_TARGET_H, laneProgress, type Lane } from "@/lib/domain/ds";

export const dynamic = "force-dynamic";

const LANE_DESC: Record<Lane, string> = {
  A: "Empleo por referido: PM/PO Jr (secundarios: BA de producto, Product Growth).",
  B: "Ingreso puente: mype del papá, Pensio y colegios; reporte de viernes.",
  C: "Estudio general: ruta de 10 semanas, SQL e inglés.",
  D: "Contenido: video, carrusel o post. Se mide constancia, no vistas.",
};

// Realineación 21/10 — cada carril es un "proyecto": A/B tienen su propio
// desglose en /carriles/[lane]; C ya vive en /ruta (Aprender) y D en /contenido.
const LANE_HREF: Record<Lane, string> = { A: "/carriles/a", B: "/carriles/b", C: "/ruta", D: "/contenido" };

export default async function CarrilesPage() {
  const d = await getWeekData();
  const lanes: Lane[] = ["A", "B", "C", "D"];
  return (
    <div className="flex flex-col gap-4">
      <header>
        <p className="hud-label">
          {d.week ? `Semana ${d.week.number}` : "Fuera de temporada"} · semana del {d.monday}
        </p>
        <h1 className="text-2xl font-semibold text-text">Carriles</h1>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {lanes.map((l) => {
          const pct = Math.round(laneProgress(l, d.hours[l]) * 100);
          return (
            <Link
              key={l}
              href={LANE_HREF[l]}
              className="flex flex-col gap-3 hud-panel p-4 transition-colors hover:border-brand/40"
              style={{ borderTopColor: LANE_COLOR[l], borderTopWidth: 3 }}
            >
              <h2 className="font-semibold text-text">
                {l} · {LANE_NAME[l]}
              </h2>
              <p className="text-sm text-text-muted">{LANE_DESC[l]}</p>
              <div>
                <div className="flex justify-between font-mono text-xs text-text-muted">
                  <span>
                    {d.hours[l]} / {LANE_TARGET_H[l]} h
                  </span>
                  <span>{pct}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Horas del carril ${l}`}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: LANE_COLOR[l] }} />
                </div>
              </div>
              <p className="font-mono text-xs text-text-muted">
                {d.tasksDone[l]} hechas · {d.tasksPending[l]} pendientes
              </p>
              <div>
                <p className="hud-label">Siguiente acción</p>
                <p className="text-sm text-text">{d.nextAction[l] ?? "Sin tareas pendientes."}</p>
              </div>
              <span className="mt-auto text-xs font-medium" style={{ color: LANE_COLOR[l] }}>
                Ver desglose →
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
