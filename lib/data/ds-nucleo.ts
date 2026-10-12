import { createDsClient } from "@/lib/supabase/ds";
import { addDays, today } from "@/lib/domain/dates";
import {
  currentDsWeek,
  daysToStart,
  mondayOf,
  type DsTask,
  type DsWeek,
  type Lane,
} from "@/lib/domain/ds";

export interface NucleoData {
  todayISO: string;
  week: DsWeek | null;
  daysToStart: number | null;
  tasks: DsTask[];
  hours: Record<Lane, number>;
  milestone: { number: number; title: string; due_on: string; criteria: string[] } | null;
  englishToday: boolean;
  englishWeek: number;
  routeB: number;
}

export async function getNucleoData(): Promise<NucleoData> {
  const db = await createDsClient();
  const todayISO = today();
  const monday = mondayOf(todayISO);
  const friday = addDays(monday, 4);

  const [weeks, tasks, hours, milestones, habits, routeB] = await Promise.all([
    db.from("ds_weeks").select("number,starts_on,ends_on").order("number"),
    db.from("ds_tasks").select("id,lane,title,status,result_rank").eq("day", todayISO).order("result_rank"),
    db.from("ds_hours_log").select("lane,actual_h").gte("day", monday).lte("day", friday),
    db.from("ds_milestones").select("number,title,due_on,criteria,status").eq("status", "pending").order("number").limit(1),
    db.from("ds_habit_log").select("day,minutes").eq("habit", "english").gte("day", monday).lte("day", friday),
    db.from("ds_routeb_actions").select("id", { count: "exact", head: true }).gte("day", monday).lte("day", friday),
  ]);

  const weekRows = (weeks.data ?? []) as DsWeek[];
  const sums: Record<Lane, number> = { A: 0, B: 0, C: 0 };
  for (const r of (hours.data ?? []) as { lane: string; actual_h: number }[]) {
    if (r.lane === "A" || r.lane === "B" || r.lane === "C") sums[r.lane] += Number(r.actual_h);
  }
  const habitRows = (habits.data ?? []) as { day: string; minutes: number }[];
  const m = (milestones.data ?? [])[0] as
    | { number: number; title: string; due_on: string; criteria: string[] }
    | undefined;

  return {
    todayISO,
    week: currentDsWeek(todayISO, weekRows),
    daysToStart: daysToStart(todayISO, weekRows),
    tasks: (tasks.data ?? []) as DsTask[],
    hours: sums,
    milestone: m ?? null,
    englishToday: habitRows.some((h) => h.day === todayISO && h.minutes > 0),
    englishWeek: habitRows.filter((h) => h.minutes > 0).length,
    routeB: routeB.count ?? 0,
  };
}
