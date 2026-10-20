import { createDsClient } from "@/lib/supabase/ds";
import { addDays, diffDays, today } from "@/lib/domain/dates";
import {
  currentDsWeek,
  daysToStart,
  englishHabitStreak,
  mondayOf,
  zeroDayAlert,
  LANE_TARGET_H,
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
  hoursWeekTotal: number;
  hoursWeekTarget: number;
  milestone: { number: number; title: string; due_on: string; criteria: string[] } | null;
  milestoneDays: number | null;
  englishToday: boolean;
  englishWeek: number;
  englishStreak: number;
  routeB: number;
  duolingo: { current: number; longest: number } | null;
  zeroAlert: boolean;
}

export async function getNucleoData(): Promise<NucleoData> {
  const db = await createDsClient();
  const todayISO = today();
  const monday = mondayOf(todayISO);
  const friday = addDays(monday, 4);

  const lookback = addDays(todayISO, -7);
  const [weeks, tasks, hours, milestones, habits, routeB, streak, recentTasks, recentHours, recentHabits, englishLog] =
    await Promise.all([
      db.from("ds_weeks").select("number,starts_on,ends_on").order("number"),
      db.from("ds_tasks").select("id,lane,title,status,result_rank").eq("day", todayISO).order("result_rank"),
      db.from("ds_hours_log").select("lane,actual_h").gte("day", monday).lte("day", friday),
      db.from("ds_milestones").select("number,title,due_on,criteria,status").eq("status", "pending").order("number").limit(1),
      db.from("ds_habit_log").select("day,minutes").eq("habit", "english").gte("day", monday).lte("day", friday),
      db.from("ds_routeb_actions").select("id", { count: "exact", head: true }).gte("day", monday).lte("day", friday),
      db.from("streaks").select("current,longest").eq("kind", "daily_english").maybeSingle(),
      db.from("ds_tasks").select("day").eq("status", "done").gte("day", lookback),
      db.from("ds_hours_log").select("day").gt("actual_h", 0).gte("day", lookback),
      db.from("ds_habit_log").select("day").gt("minutes", 0).gte("day", lookback),
      // Sin filtro de fecha -- la racha puede ser más larga que el lookback de 7 días del zeroAlert.
      db.from("ds_habit_log").select("day").eq("habit", "english").gt("minutes", 0),
    ]);
  const active = new Set<string>();
  for (const q of [recentTasks, recentHours, recentHabits]) {
    for (const r of (q.data ?? []) as { day: string }[]) active.add(r.day);
  }

  const weekRows = (weeks.data ?? []) as DsWeek[];
  const sums: Record<Lane, number> = { A: 0, B: 0, C: 0 };
  for (const r of (hours.data ?? []) as { lane: string; actual_h: number }[]) {
    if (r.lane === "A" || r.lane === "B" || r.lane === "C") sums[r.lane] += Number(r.actual_h);
  }
  const habitRows = (habits.data ?? []) as { day: string; minutes: number }[];
  const m = (milestones.data ?? [])[0] as
    | { number: number; title: string; due_on: string; criteria: string[] }
    | undefined;

  const englishActiveDays = new Set(((englishLog.data ?? []) as { day: string }[]).map((r) => r.day));

  return {
    todayISO,
    week: currentDsWeek(todayISO, weekRows),
    daysToStart: daysToStart(todayISO, weekRows),
    tasks: (tasks.data ?? []) as DsTask[],
    hours: sums,
    hoursWeekTotal: sums.A + sums.B + sums.C,
    hoursWeekTarget: LANE_TARGET_H.A + LANE_TARGET_H.B + LANE_TARGET_H.C,
    milestone: m ?? null,
    milestoneDays: m ? diffDays(todayISO, m.due_on) : null,
    englishToday: habitRows.some((h) => h.day === todayISO && h.minutes > 0),
    englishWeek: habitRows.filter((h) => h.minutes > 0).length,
    englishStreak: englishHabitStreak(todayISO, englishActiveDays),
    routeB: routeB.count ?? 0,
    duolingo: (streak.data as { current: number; longest: number } | null) ?? null,
    zeroAlert: zeroDayAlert(todayISO, weekRows[0]?.starts_on ?? "9999-12-31", active),
  };
}
