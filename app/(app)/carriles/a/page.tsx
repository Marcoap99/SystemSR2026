import Link from "next/link";
import { createDsClient } from "@/lib/supabase/ds";
import { getWeekData } from "@/lib/data/ds-week";
import { addDays, mondayOf, today } from "@/lib/domain/dates";
import { LANE_COLOR, LANE_NAME, LANE_TARGET_H, laneProgress } from "@/lib/domain/ds";
import { LaneTaskList, type LaneTask } from "@/components/carriles/LaneTaskList";
import { RouteBButton } from "@/components/nucleo/RouteBButton";

export const dynamic = "force-dynamic";

interface Strategy {
  code: string;
  name: string;
  weekly_target: number;
}

// Estrategia 2 (contacto con personas, 27/10): checklist finito de esta
// tanda de contactos, no una actividad recurrente como las 5 estrategias
// originales. Su avance se mide por tareas hechas, no por acciones de
// Ruta B registradas esta semana.
const TASK_TRACKED_STRATEGIES = new Set(["mensajes", "ventia", "postulaciones", "sistema"]);

/** Realineación 21/10 — Carril A: objetivo, estrategias con avance semanal, seguimientos de Red. */
export default async function CarrilAPage() {
  const db = await createDsClient();
  const monday = mondayOf(today());
  const friday = addDays(monday, 4);

  const [infoQ, strategiesQ, tasksQ, routeBQ, connectionsQ, reunionesQ, week] = await Promise.all([
    db.from("ds_lane_info").select("objective,weekly_goal").eq("lane", "A").maybeSingle(),
    db.from("ds_strategies").select("code,name,weekly_target").eq("lane", "A").eq("active", true).order("sort_order"),
    db.from("ds_tasks").select("id,title,status,day,strategy_code").eq("lane", "A").order("created_at"),
    db.from("ds_routeb_actions").select("strategy_code").gte("day", monday).lte("day", friday),
    db
      .from("ds_connections")
      .select("id,persona,empresa,etapa,proxima_accion,proxima_accion_fecha,created_at")
      .neq("etapa", "cerrado"),
    db.from("ds_connections").select("id", { count: "exact", head: true }).eq("canal", "Perú Tech Week").eq("etapa", "reunion"),
    getWeekData(),
  ]);

  const info = infoQ.data as { objective: string | null; weekly_goal: string | null } | null;
  const strategies = (strategiesQ.data ?? []) as Strategy[];
  const tasks = (tasksQ.data ?? []) as (LaneTask & { strategy_code: string | null })[];
  const actionsByStrategy = new Map<string, number>();
  for (const r of (routeBQ.data ?? []) as { strategy_code: string | null }[]) {
    if (!r.strategy_code) continue;
    actionsByStrategy.set(r.strategy_code, (actionsByStrategy.get(r.strategy_code) ?? 0) + 1);
  }
  const tasksDoneByStrategy = new Map<string, number>();
  for (const t of tasks) {
    if (t.strategy_code && t.status === "done") {
      tasksDoneByStrategy.set(t.strategy_code, (tasksDoneByStrategy.get(t.strategy_code) ?? 0) + 1);
    }
  }
  const noStrategyTasks = tasks.filter((t) => !t.strategy_code);
  const strategiesCore = strategies.filter((s) => !TASK_TRACKED_STRATEGIES.has(s.code));
  const strategiesContacto = strategies.filter((s) => TASK_TRACKED_STRATEGIES.has(s.code));
  const conversacionesAgendadas = reunionesQ.count ?? 0;

  const followUps = ((connectionsQ.data ?? []) as {
    id: string;
    persona: string;
    empresa: string | null;
    etapa: string;
    proxima_accion: string | null;
    proxima_accion_fecha: string | null;
    created_at: string;
  }[]).filter((c) => {
    if (c.proxima_accion_fecha && c.proxima_accion_fecha < today()) return true;
    // "sin escribir en 24 h": creado en un día de calendario anterior y sigue en "nuevo".
    if (c.etapa === "nuevo" && c.created_at.slice(0, 10) < today()) return true;
    return false;
  });

  const hoursPct = Math.round(laneProgress("A", week.hours.A) * 100);

  function renderStrategy(s: Strategy) {
    const done = TASK_TRACKED_STRATEGIES.has(s.code) ? tasksDoneByStrategy.get(s.code) ?? 0 : actionsByStrategy.get(s.code) ?? 0;
    const pct = s.weekly_target > 0 ? Math.min(100, Math.round((done / s.weekly_target) * 100)) : 0;
    return (
      <section key={s.code} className="hud-panel flex flex-col gap-3 p-4">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-text">{s.name}</h2>
            <span className="font-mono text-xs text-text-muted">
              {done}/{s.weekly_target}{TASK_TRACKED_STRATEGIES.has(s.code) ? " hechas" : " esta semana"}
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: LANE_COLOR.A }} />
          </div>
        </div>
        <LaneTaskList
          lane="A"
          tasks={tasks.filter((t) => t.strategy_code === s.code)}
          strategyCode={s.code}
          placeholder={`Nueva acción: ${s.name}`}
        />
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Link href="/carriles" className="text-sm text-text-muted hover:text-text">
        ← Carriles
      </Link>
      <header className="flex flex-col gap-2" style={{ borderTopColor: LANE_COLOR.A, borderTopWidth: 3 }}>
        <h1 className="text-2xl font-semibold text-text">A · {LANE_NAME.A}</h1>
        {info?.objective ? <p className="text-sm text-text-muted">{info.objective}</p> : null}
        {info?.weekly_goal ? <p className="font-mono text-xs text-text-muted">Meta semanal: {info.weekly_goal}</p> : null}
        <div>
          <div className="flex justify-between font-mono text-xs text-text-muted">
            <span>
              {week.hours.A} / {LANE_TARGET_H.A} h esta semana
            </span>
            <span>{hoursPct}%</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full" style={{ width: `${hoursPct}%`, background: LANE_COLOR.A }} />
          </div>
        </div>
        <RouteBButton strategies={strategies} />
      </header>

      {followUps.length > 0 ? (
        <section className="hud-panel flex flex-col gap-2 p-4">
          <h2 className="hud-label">Seguimientos pendientes ({followUps.length})</h2>
          <ul className="flex flex-col gap-2">
            {followUps.map((c) => (
              <li key={c.id} className="flex items-center gap-2 rounded-card border border-border bg-surface-2 px-3 py-2 text-sm">
                <span className="min-w-0 flex-1">
                  <span className="text-text">{c.persona}</span>
                  {c.empresa ? <span className="text-text-muted"> · {c.empresa}</span> : null}
                  {c.proxima_accion ? <span className="text-text-muted"> — {c.proxima_accion}</span> : null}
                </span>
                <span className="shrink-0 rounded-badge bg-warn/15 px-2 py-0.5 text-xs text-warn">
                  {c.etapa === "nuevo" ? "nuevo sin contactar" : "vencida"}
                </span>
              </li>
            ))}
          </ul>
          <Link href="/red" className="text-xs text-brand hover:underline">
            Ver Red →
          </Link>
        </section>
      ) : null}

      {strategiesCore.map(renderStrategy)}

      {strategiesContacto.length > 0 ? (
        <section className="flex flex-col gap-3">
          <div className="hud-panel flex flex-wrap items-center justify-between gap-2 p-3">
            <h2 className="font-semibold text-text">Estrategia 2: contacto con personas</h2>
            <p className="font-mono text-xs text-text-muted">
              {tasksDoneByStrategy.get("mensajes") ?? 0}/7 mensajes · {conversacionesAgendadas}/2 conversaciones agendadas · {tasksDoneByStrategy.get("postulaciones") ?? 0}/3 postulaciones
            </p>
            <Link href="/red/tech-week" className="text-xs text-brand hover:underline">
              Ver contactos de Perú Tech Week →
            </Link>
          </div>
          {strategiesContacto.map(renderStrategy)}
        </section>
      ) : null}

      {noStrategyTasks.length > 0 ? (
        <section className="hud-panel flex flex-col gap-3 p-4">
          <h2 className="font-semibold text-text">Otras acciones</h2>
          <LaneTaskList lane="A" tasks={noStrategyTasks} />
        </section>
      ) : null}
    </div>
  );
}
