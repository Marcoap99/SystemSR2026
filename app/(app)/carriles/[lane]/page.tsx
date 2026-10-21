import Link from "next/link";
import { notFound } from "next/navigation";
import { createDsClient } from "@/lib/supabase/ds";
import { LANE_COLOR, LANE_NAME, LANE_TARGET_H, laneProgress, type Lane } from "@/lib/domain/ds";
import { LaneTaskList, type LaneTask } from "@/components/carriles/LaneTaskList";

export const dynamic = "force-dynamic";

const LANE_DESC: Record<"A" | "B", string> = {
  A: "Empleo por referido: PM/PO Jr (secundarios: BA de producto, Product Growth).",
  B: "Ingreso puente: mype del papá, Pensio y colegios; reporte de viernes.",
};

/** Realineación 21/10 — desglose de un carril (A o B), tipo gestión de proyecto. C vive en /ruta, D en /contenido. */
export default async function LanePage({ params }: { params: Promise<{ lane: string }> }) {
  const { lane: raw } = await params;
  const lane = raw.toUpperCase();
  if (lane !== "A" && lane !== "B") notFound();

  const db = await createDsClient();
  const [tasksQ, hoursQ] = await Promise.all([
    db.from("ds_tasks").select("id,title,status,day").eq("lane", lane).order("created_at"),
    db.from("ds_hours_log").select("actual_h").eq("lane", lane),
  ]);
  const tasks = (tasksQ.data ?? []) as LaneTask[];
  const totalHours = Math.round(((hoursQ.data ?? []) as { actual_h: number }[]).reduce((s, r) => s + Number(r.actual_h), 0) * 10) / 10;
  const pct = Math.round(laneProgress(lane as Lane, totalHours) * 100);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/carriles" className="text-sm text-text-muted hover:text-text">
        ← Carriles
      </Link>
      <header className="flex flex-col gap-2" style={{ borderTopColor: LANE_COLOR[lane as Lane], borderTopWidth: 3 }}>
        <h1 className="text-2xl font-semibold text-text">
          {lane} · {LANE_NAME[lane as Lane]}
        </h1>
        <p className="text-sm text-text-muted">{LANE_DESC[lane]}</p>
        <div>
          <div className="flex justify-between font-mono text-xs text-text-muted">
            <span>
              {totalHours} / {LANE_TARGET_H[lane as Lane]} h (histórico)
            </span>
            <span>{pct}%</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: LANE_COLOR[lane as Lane] }} />
          </div>
        </div>
      </header>

      <LaneTaskList lane={lane as Lane} tasks={tasks} />
    </div>
  );
}
