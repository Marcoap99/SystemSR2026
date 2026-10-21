import Link from "next/link";
import { createDsClient } from "@/lib/supabase/ds";
import { getWeekData } from "@/lib/data/ds-week";
import { LANE_COLOR, LANE_NAME } from "@/lib/domain/ds";
import { LaneTaskList, type LaneTask } from "@/components/carriles/LaneTaskList";
import { MiamiSection } from "@/components/carriles/MiamiSection";
import { LaneNotesButton } from "@/components/carriles/LaneNotesButton";
import type { NoteDocument } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Strategy {
  code: string;
  name: string;
}

/** Realineación 21/10 — Carril B: objetivo, etapas del cliente 1, Apoyo deal Miami, notas. */
export default async function CarrilBPage() {
  const db = await createDsClient();
  const [infoQ, strategiesQ, tasksQ, week] = await Promise.all([
    db
      .from("ds_lane_info")
      .select("objective,weekly_goal,notes,miami_weekly_cap_h,miami_hours_logged")
      .eq("lane", "B")
      .maybeSingle(),
    db.from("ds_strategies").select("code,name").eq("lane", "B").eq("active", true).order("sort_order"),
    db.from("ds_tasks").select("id,title,status,day,strategy_code").eq("lane", "B").order("created_at"),
    getWeekData(),
  ]);

  const info = infoQ.data as {
    objective: string | null;
    weekly_goal: string | null;
    notes: NoteDocument | null;
    miami_weekly_cap_h: number | null;
    miami_hours_logged: number;
  } | null;
  const etapas = (strategiesQ.data ?? []) as Strategy[];
  const tasks = (tasksQ.data ?? []) as (LaneTask & { strategy_code: string | null })[];
  const recurringTasks = tasks.filter((t) => !t.strategy_code);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/carriles" className="text-sm text-text-muted hover:text-text">
        ← Carriles
      </Link>
      <header className="flex flex-col gap-2" style={{ borderTopColor: LANE_COLOR.B, borderTopWidth: 3 }}>
        <h1 className="text-2xl font-semibold text-text">B · {LANE_NAME.B}</h1>
        {info?.objective ? <p className="text-sm text-text-muted">{info.objective}</p> : null}
        {info?.weekly_goal ? <p className="font-mono text-xs text-text-muted">Meta semanal: {info.weekly_goal}</p> : null}
        <p className="font-mono text-xs text-text-muted">{week.hours.B} h esta semana — presencial y flexible, sin alertas de exceso.</p>
      </header>

      <section className="hud-panel flex flex-col gap-3 p-4">
        <h2 className="hud-label">Etapas del cliente 1</h2>
        <ol className="flex flex-col gap-2">
          {etapas.map((e, i) => {
            const etapaTasks = tasks.filter((t) => t.strategy_code === e.code);
            const done = etapaTasks.some((t) => t.status === "done");
            return (
              <li key={e.code} className="rounded-card border border-border bg-surface-2 p-3">
                <div className="flex items-center gap-2">
                  <span
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-xs"
                    style={{ background: done ? LANE_COLOR.B : "transparent", border: `2px solid ${LANE_COLOR.B}`, color: done ? "var(--color-bg)" : "var(--color-text-muted)" }}
                  >
                    {i + 1}
                  </span>
                  <span className={`text-sm ${done ? "text-text-muted line-through" : "text-text"}`}>{e.name}</span>
                </div>
                <div className="mt-2">
                  <LaneTaskList lane="B" tasks={etapaTasks} strategyCode={e.code} placeholder={`Nota u acción: ${e.name}`} />
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {recurringTasks.length > 0 ? (
        <section className="hud-panel flex flex-col gap-3 p-4">
          <h2 className="font-semibold text-text">Recurrente</h2>
          <LaneTaskList lane="B" tasks={recurringTasks} />
        </section>
      ) : null}

      <MiamiSection hoursLogged={info?.miami_hours_logged ?? 0} weeklyCap={info?.miami_weekly_cap_h ?? null} />

      <section className="hud-panel flex flex-col gap-2 p-4">
        <h2 className="hud-label">Siguiente cliente / en pausa</h2>
        <LaneNotesButton lane="B" title="Notas de Carril B" notes={info?.notes ?? null} />
      </section>
    </div>
  );
}
