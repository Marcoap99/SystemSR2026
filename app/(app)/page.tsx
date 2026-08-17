import { getDashboardData } from "@/lib/data/dashboard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Countdown } from "@/components/dashboard/Countdown";
import { Quests } from "@/components/dashboard/Quests";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { GroupBars } from "@/components/dashboard/GroupBars";
import { Seals } from "@/components/dashboard/Seals";
import { RecentLog } from "@/components/dashboard/RecentLog";
import { BossFights } from "@/components/dashboard/BossFights";

// Depende de la sesión (cookies) y de "hoy" — nunca se debe servir cacheado/estático.
export const dynamic = "force-dynamic";

/** 7.1 — orden vertical exacto según el PRD. */
export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header: semana actual + barra de fase + fase activa */}
      <DashboardHeader week={data.weekRow} phase={data.activePhase} phaseRatio={data.phaseRatio} />

      {/* 2. Contador regresivo — solo si aplica (6.7) */}
      {data.showCountdown && data.nextBoss && data.daysUntilBoss !== null ? (
        <Countdown boss={data.nextBoss} days={data.daysUntilBoss} />
      ) : null}

      {/* 3. Quest de la semana */}
      <Quests quests={data.quests} isFiestas={data.isFiestasWeek} />

      {/* 4. Rachas — 2 tarjetas */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <StreakCard kind="daily_english" streak={data.streaks.daily_english} />
        <StreakCard kind="weekly_log" streak={data.streaks.weekly_log} />
      </div>

      {/* 5. Barras (G) */}
      <GroupBars groups={data.groups} />

      {/* 6. Sellos (L) */}
      <Seals results={data.results} />

      {/* 7. Log */}
      <RecentLog entries={data.recentLog} />

      {/* 8. Boss fights */}
      <BossFights bosses={data.bosses} />
    </div>
  );
}
