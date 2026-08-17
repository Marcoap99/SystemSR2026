import { createClient } from "@/lib/supabase/server";
import { today } from "@/lib/domain/dates";
import { currentWeek, isFiestas } from "@/lib/domain/weeks";
import { groupProgress, phaseProgress } from "@/lib/domain/progress";
import { daysUntil, nextPendingBoss, shouldShowCountdown } from "@/lib/domain/countdown";
import type {
  Artifact,
  ArtifactGroup,
  Boss,
  LogEntry,
  Phase,
  Quest,
  Result,
  Streak,
  Week,
} from "@/lib/types";

export interface DashboardData {
  todayISO: string;
  weekRow: Week | null;
  isFiestasWeek: boolean;
  activePhase: Phase | null;
  phaseRatio: number;
  quests: Quest[];
  streaks: Partial<Record<"daily_english" | "weekly_log", Streak>>;
  bosses: Boss[];
  nextBoss: Boss | null;
  showCountdown: boolean;
  daysUntilBoss: number | null;
  groups: Array<{ group: ArtifactGroup; progress: ReturnType<typeof groupProgress> }>;
  results: Result[];
  recentLog: LogEntry[];
}

/** Carga y deriva todo lo que necesita el dashboard (7.1) en un solo lugar. */
export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();
  const todayISO = today();

  const [
    { data: phases },
    { data: weeks },
    { data: bosses },
    { data: streakRows },
    { data: groups },
    { data: artifacts },
    { data: results },
    { data: recentLog },
  ] = await Promise.all([
    supabase.from("phases").select("*").order("number"),
    supabase.from("weeks").select("*").order("number"),
    supabase.from("bosses").select("*").order("number"),
    supabase.from("streaks").select("*"),
    supabase.from("artifact_groups").select("*").order("code"),
    supabase.from("artifacts").select("*"),
    supabase.from("results").select("*").order("code"),
    supabase.from("log_entries").select("*").order("date", { ascending: false }).limit(5),
  ]);

  const weekRow = currentWeek((weeks ?? []) as Week[], todayISO);

  const { data: questRows } = weekRow
    ? await supabase.from("quests").select("*").eq("week_number", weekRow.number).order("type")
    : { data: [] as Quest[] };

  const activePhase =
    (phases ?? [])
      .filter((p) => p.unlocked)
      .sort((a, b) => b.number - a.number)[0] ?? null;

  const phaseRatio = weekRow ? phaseProgress(weekRow.number) : 0;

  const nextBoss = nextPendingBoss((bosses ?? []) as Boss[]);
  const showCountdown = nextBoss ? shouldShowCountdown(nextBoss.date, todayISO) : false;
  const daysUntilBoss = nextBoss ? daysUntil(nextBoss.date, todayISO) : null;

  const streaks: DashboardData["streaks"] = {};
  for (const row of streakRows ?? []) {
    streaks[row.kind] = row;
  }

  const groupsWithProgress = (groups ?? []).map((group) => {
    const items: Artifact[] = (artifacts ?? []).filter((a) => a.group_code === group.code);
    return { group, progress: groupProgress(items) };
  });

  return {
    todayISO,
    weekRow,
    isFiestasWeek: weekRow ? isFiestas(weekRow) : false,
    activePhase,
    phaseRatio,
    quests: (questRows ?? []) as Quest[],
    streaks,
    bosses: (bosses ?? []) as Boss[],
    nextBoss,
    showCountdown,
    daysUntilBoss,
    groups: groupsWithProgress,
    results: (results ?? []) as Result[],
    recentLog: (recentLog ?? []) as LogEntry[],
  };
}
