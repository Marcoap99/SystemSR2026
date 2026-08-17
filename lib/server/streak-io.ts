/**
 * Puente entre las filas de `streaks`/`streak_events` en Supabase y las
 * funciones puras de lib/domain/streaks.ts. No es un Server Action (no
 * lleva "use server") — es un helper que los actions importan.
 */
import type { createClient } from "@/lib/supabase/server";
import type { StreakKindDb } from "@/lib/types";
import type { ActionResult, StreakState } from "@/lib/domain/streaks";

type Supa = Awaited<ReturnType<typeof createClient>>;

export async function loadStreakState(supabase: Supa, kind: StreakKindDb): Promise<StreakState> {
  const { data, error } = await supabase.from("streaks").select("*").eq("kind", kind).single();
  if (error || !data) {
    throw new Error(`No se encontró la racha "${kind}": ${error?.message ?? "sin datos"}`);
  }
  return {
    current: data.current,
    longest: data.longest,
    lastMarked: data.last_marked,
    freezesTotal: data.freezes_total,
    freezesUsed: data.freezes_used,
    quarter: data.quarter,
  };
}

export async function persistStreakResult(
  supabase: Supa,
  kind: StreakKindDb,
  result: ActionResult,
): Promise<void> {
  const { state, events } = result;

  const { error: updateError } = await supabase
    .from("streaks")
    .update({
      current: state.current,
      longest: state.longest,
      last_marked: state.lastMarked,
      freezes_total: state.freezesTotal,
      freezes_used: state.freezesUsed,
      quarter: state.quarter,
    })
    .eq("kind", kind);

  if (updateError) throw new Error(updateError.message);

  if (events.length > 0) {
    const { error: eventsError } = await supabase
      .from("streak_events")
      .insert(events.map((e) => ({ kind, period: e.period, action: e.action })));
    if (eventsError) throw new Error(eventsError.message);
  }
}
