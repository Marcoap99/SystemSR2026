import { createDsClient } from "@/lib/supabase/ds";
import { addDays, today } from "@/lib/domain/dates";
import { currentDsWeek, mondayOf, type DsWeek, type Lane } from "@/lib/domain/ds";

export interface WeekData {
  todayISO: string;
  week: DsWeek | null;
  monday: string;
  hours: Record<Lane, number>;
  tasksDone: Record<Lane, number>;
  tasksPending: Record<Lane, number>;
  nextAction: Record<Lane, string | null>;
  englishDays: number;
  sqlDays: number;
  routeB: number;
  review: { answers: Record<string, string>; next_results: string[] } | null;
}

const zero = (): Record<Lane, number> => ({ A: 0, B: 0, C: 0, D: 0 });
const CONTENT_STAGE_ORDER = ["idea", "guion", "grabado", "editado", "programado", "publicado"] as const;

export async function getWeekData(): Promise<WeekData> {
  const db = await createDsClient();
  const todayISO = today();
  const monday = mondayOf(todayISO);
  const friday = addDays(monday, 4);

  const [weeks, hours, tasks, habits, routeB, content, contentVariants] = await Promise.all([
    db.from("ds_weeks").select("number,starts_on,ends_on").order("number"),
    db.from("ds_hours_log").select("lane,actual_h").gte("day", monday).lte("day", friday),
    db.from("ds_tasks").select("lane,title,status,day,created_at").order("created_at"),
    db.from("ds_habit_log").select("habit,minutes").gte("day", monday).lte("day", friday),
    db.from("ds_routeb_actions").select("id", { count: "exact", head: true }).gte("day", monday).lte("day", friday),
    // Carril D (realineación): estado/siguiente acción vienen de ds_content_pieces, no de ds_tasks.
    db.from("ds_content_pieces").select("tema,estado,created_at").order("created_at"),
    // El conteo de publicadas usa la fecha real de la variante, no fecha_objetivo.
    db.from("ds_content_variants").select("piece_id,estado,published_at"),
  ]);

  const week = currentDsWeek(todayISO, (weeks.data ?? []) as DsWeek[]);
  const h = zero();
  for (const r of (hours.data ?? []) as { lane: Lane; actual_h: number }[]) if (r.lane in h) h[r.lane] += Number(r.actual_h);

  const done = zero();
  const pending = zero();
  const next: Record<Lane, string | null> = { A: null, B: null, C: null, D: null };
  for (const t of (tasks.data ?? []) as { lane: Lane; title: string; status: string; day: string | null }[]) {
    if (!(t.lane in done)) continue;
    if (t.status === "done") {
      if (t.day && t.day >= monday && t.day <= friday) done[t.lane] += 1;
    } else if (t.status === "pending") {
      pending[t.lane] += 1;
      next[t.lane] ??= t.title;
    }
  }

  const contentRows = (content.data ?? []) as {
    tema: string;
    estado: (typeof CONTENT_STAGE_ORDER)[number];
    created_at: string;
  }[];
  const publishedPieceIds = new Set(
    ((contentVariants.data ?? []) as { piece_id: string; estado: string; published_at: string | null }[])
      .filter((v) => v.estado === "publicado" && v.published_at && v.published_at >= monday && v.published_at <= friday)
      .map((v) => v.piece_id),
  );
  done.D = publishedPieceIds.size;
  pending.D = contentRows.filter((p) => p.estado !== "publicado").length;
  next.D =
    contentRows
      .filter((p) => p.estado !== "publicado")
      .sort(
        (a, b) =>
          CONTENT_STAGE_ORDER.indexOf(a.estado) - CONTENT_STAGE_ORDER.indexOf(b.estado) ||
          a.created_at.localeCompare(b.created_at),
      )[0]?.tema ?? null;

  const habitRows = (habits.data ?? []) as { habit: string; minutes: number }[];
  let review: WeekData["review"] = null;
  if (week) {
    const r = await db.from("ds_reviews").select("answers,next_results").eq("week", week.number).maybeSingle();
    review = (r.data as WeekData["review"]) ?? null;
  }

  return {
    todayISO,
    week,
    monday,
    hours: h,
    tasksDone: done,
    tasksPending: pending,
    nextAction: next,
    englishDays: habitRows.filter((x) => x.habit === "english" && x.minutes > 0).length,
    sqlDays: habitRows.filter((x) => x.habit === "sql" && x.minutes > 0).length,
    routeB: routeB.count ?? 0,
    review,
  };
}
