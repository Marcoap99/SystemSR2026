import { createClient } from "@/lib/supabase/server";
import { addDays, isFriday, today } from "@/lib/domain/dates";
import { currentWeek, isFiestas } from "@/lib/domain/weeks";
import { groupProgress, phaseProgress } from "@/lib/domain/progress";
import { daysUntil, nextPendingBoss, shouldShowCountdown } from "@/lib/domain/countdown";
import { contextualGreeting, type ClosedArtifactInfo } from "@/lib/domain/greeting";
import { evaluateBadges, type BadgeState } from "@/lib/domain/badges";
import { getDisplayState } from "@/lib/domain/streaks";
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
  greeting: string;
  badges: BadgeState[];
  // V1.7: null si nunca configuró Duolingo -- StreakCard decide qué mostrar.
  duolingoUsername: string | null;
  // V1.7.1: el streak que Duolingo devolvió la última vez que se sincronizó
  // (puede ser más nuevo que el `current` de daily_english si hoy todavía
  // no se abrió esta app). Con Duolingo conectado, StreakCard muestra este
  // número en vez del propio -- el propio sigue existiendo por debajo para
  // freezes/insignias, pero lo que el usuario ve es lo que dice Duolingo.
  duolingoLastStreak: number | null;
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
    { data: artifactDoneEvents },
    { data: ex4Events },
    { data: userSettings },
  ] = await Promise.all([
    supabase.from("phases").select("*").order("number"),
    supabase.from("weeks").select("*").order("number"),
    supabase.from("bosses").select("*").order("number"),
    supabase.from("streaks").select("*"),
    supabase.from("artifact_groups").select("*").order("code"),
    supabase.from("artifacts").select("*"),
    supabase.from("results").select("*").order("code"),
    supabase.from("log_entries").select("*").order("date", { ascending: false }).limit(5),
    // C.2: la última condición de saludo revisa si se cerró un artefacto
    // ayer; C.3 no guarda "insignia ganada", se deriva cada vez de la
    // evidencia real (acá, el evento de app_events que ya se loguea al
    // cerrar un artefacto).
    supabase
      .from("app_events")
      .select("payload, created_at")
      .eq("event_type", "artifact_done")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("exposure_events")
      .select("date")
      .eq("exposure_code", "EX4")
      .eq("counts", true)
      .order("date", { ascending: false })
      .limit(1),
    // V1.7: fila puede no existir (nunca tocó el ajuste) -- maybeSingle.
    supabase.from("user_settings").select("duolingo_username, duolingo_last_streak").maybeSingle(),
  ]);

  const weekRow = currentWeek((weeks ?? []) as Week[], todayISO);

  const [{ data: questRows }, { data: weekLogRows }] = weekRow
    ? await Promise.all([
        supabase.from("quests").select("*").eq("week_number", weekRow.number).order("type"),
        supabase.from("log_entries").select("id").eq("week_number", weekRow.number).limit(1),
      ])
    : [{ data: [] as Quest[] }, { data: [] as { id: string }[] }];

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

  // V1.2: `.order("code")` en la query de arriba ordena como texto --
  // con G10 en el medio eso da G1, G10, G2, G3... (la comparación de
  // strings trata "G10" como más chico que "G2"). Reordenar acá por el
  // número real.
  const sortedGroups = [...(groups ?? [])].sort(
    (a, b) => Number(a.code.slice(1)) - Number(b.code.slice(1)),
  );
  const groupsWithProgress = sortedGroups.map((group) => {
    const items: Artifact[] = (artifacts ?? []).filter((a) => a.group_code === group.code);
    return { group, progress: groupProgress(items) };
  });

  // C.2: el artefacto cerrado "ayer" en hora de Lima, si hay uno.
  const yesterdayISO = addDays(todayISO, -1);
  const artifactClosedYesterday: ClosedArtifactInfo | null = (() => {
    const event = (artifactDoneEvents ?? []).find(
      (e) => today(new Date(e.created_at)) === yesterdayISO,
    );
    const code = event ? (event.payload as { code?: string })?.code : undefined;
    if (!code) return null;
    const artifact = (artifacts ?? []).find((a) => a.code === code);
    if (!artifact) return null;
    const groupEntry = groupsWithProgress.find((g) => g.group.code === artifact.group_code);
    if (!groupEntry) return null;
    return {
      code,
      groupTitle: groupEntry.group.title,
      groupDone: groupEntry.progress.done,
      groupTotal: groupEntry.progress.total,
    };
  })();

  const dailyStreakRow = streaks.daily_english;
  const dailyDisplay = dailyStreakRow
    ? getDisplayState(
        {
          current: dailyStreakRow.current,
          longest: dailyStreakRow.longest,
          lastMarked: dailyStreakRow.last_marked,
          freezesTotal: dailyStreakRow.freezes_total,
          freezesUsed: dailyStreakRow.freezes_used,
          quarter: dailyStreakRow.quarter,
        },
        "daily_english",
        todayISO,
      )
    : null;

  const greeting = contextualGreeting({
    weekNumber: weekRow?.number ?? null,
    phaseRatio,
    dailyStreak: dailyDisplay,
    upcomingBoss: showCountdown && nextBoss && daysUntilBoss !== null
      ? { number: nextBoss.number, daysUntil: daysUntilBoss }
      : null,
    artifactClosedYesterday,
    isFridayWithoutLog: isFriday(todayISO) && (weekLogRows ?? []).length === 0,
  });

  const resultAchieved: Record<string, boolean> = {};
  const resultAchievedAt: Record<string, string | null> = {};
  for (const r of results ?? []) {
    resultAchieved[r.code] = r.achieved;
    resultAchievedAt[r.code] = r.achieved_at;
  }
  const boss1 = (bosses ?? []).find((b) => b.number === 1) ?? null;
  const badges = evaluateBadges({
    resultAchieved,
    resultAchievedAt,
    dailyStreakLongest: streaks.daily_english?.longest ?? 0,
    weeklyLogStreakLongest: streaks.weekly_log?.longest ?? 0,
    ex4Counted: (ex4Events ?? []).length > 0,
    ex4CountedAt: ex4Events?.[0]?.date ?? null,
    boss1Won: boss1?.status === "won",
    boss1Date: boss1?.date ?? null,
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
    greeting,
    badges,
    duolingoUsername: userSettings?.duolingo_username ?? null,
    duolingoLastStreak: userSettings?.duolingo_username ? (userSettings?.duolingo_last_streak ?? 0) : null,
  };
}
