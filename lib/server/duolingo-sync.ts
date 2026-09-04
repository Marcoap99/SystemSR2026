/**
 * V1.7 — Duolingo como fuente de "hice inglés hoy" para daily_english.
 * La API pública de perfil de Duolingo (sin login, solo el username)
 * expone `streak`; si ese número subió desde la última vez que se miró,
 * se marca el período de hoy sola, sin que el usuario tenga que abrir
 * esta app -- resuelve el problema real (findes sin laptop) usando el
 * streak real de Duolingo como dato, en vez de inventar o pisar un
 * número.
 *
 * Best-effort en todos los sentidos: sin username configurado, sin red,
 * perfil privado, o Duolingo caído -- nunca debe romper la carga de la
 * página, solo se loguea y listo (mismo criterio que app_events). Se
 * re-chequea como máximo cada 30 minutos (duolingo_last_checked_at) para
 * no golpear una API no oficial en cada navegación.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";
import { markPeriod } from "@/lib/domain/streaks";
import { loadStreakState, persistStreakResult } from "@/lib/server/streak-io";
import { logAppEvent } from "@/lib/server/events";

const DUOLINGO_USERS_ENDPOINT = "https://www.duolingo.com/2017-06-30/users";
const RECHECK_MINUTES = 30;

async function fetchDuolingoStreak(username: string): Promise<number | null> {
  try {
    const res = await fetch(`${DUOLINGO_USERS_ENDPOINT}?username=${encodeURIComponent(username)}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { users?: Array<{ streak?: number }> };
    const streak = data.users?.[0]?.streak;
    return typeof streak === "number" ? streak : null;
  } catch {
    return null;
  }
}

export async function syncDuolingoStreak(
  supabase: SupabaseClient<Database>,
  todayISO: string,
): Promise<void> {
  try {
    const { data: settings } = await supabase.from("user_settings").select("*").maybeSingle();
    if (!settings?.duolingo_username) return;

    if (settings.duolingo_last_checked_at) {
      const minutesSince = (Date.now() - new Date(settings.duolingo_last_checked_at).getTime()) / 60_000;
      if (minutesSince < RECHECK_MINUTES) return;
    }

    const duoStreak = await fetchDuolingoStreak(settings.duolingo_username);
    if (duoStreak === null) return;

    const grew = duoStreak > settings.duolingo_last_streak;

    await supabase
      .from("user_settings")
      .update({ duolingo_last_streak: duoStreak, duolingo_last_checked_at: new Date().toISOString() })
      .eq("user_id", settings.user_id);

    if (!grew) return;

    const state = await loadStreakState(supabase, "daily_english");
    const result = markPeriod(state, "daily_english", todayISO);
    await persistStreakResult(supabase, "daily_english", result);

    if (result.events.some((e) => e.action === "marked")) {
      await logAppEvent(supabase, "streak_marked", { kind: "daily_english", source: "duolingo" });
    }
  } catch (err) {
    console.error("[duolingo-sync] fallo silencioso:", err instanceof Error ? err.message : err);
  }
}
