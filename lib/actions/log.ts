"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { today } from "@/lib/domain/dates";
import { currentWeek } from "@/lib/domain/weeks";
import { markPeriod } from "@/lib/domain/streaks";
import { compileExpedienteMarkdown } from "@/lib/domain/expediente";
import { loadStreakState, persistStreakResult } from "@/lib/server/streak-io";
import { logAppEvent } from "@/lib/server/events";
import type { Week } from "@/lib/types";

export interface NewLogEntryInput {
  date: string;
  what: string;
  evidence: string;
  ref_code?: string | null;
}

/**
 * El corazón del sistema (PRD 5). Además de guardar la entrada, aplica
 * 6.2: si el log es de la semana en curso (no un backfill de una semana
 * pasada), marca automáticamente la racha weekly_log.
 */
export async function createLogEntryAction(input: NewLogEntryInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: weeks, error: weeksError } = await supabase
    .from("weeks")
    .select("number, start_date, end_date");
  if (weeksError) throw new Error(weeksError.message);
  if (!weeks || weeks.length === 0) throw new Error("No hay semanas configuradas.");

  const todayISO = today();
  const entryWeek = currentWeek(weeks as Week[], input.date);
  const activeWeek = currentWeek(weeks as Week[], todayISO);
  if (!entryWeek) throw new Error("No se pudo determinar la semana de esta entrada.");

  const { error: insertError } = await supabase.from("log_entries").insert({
    week_number: entryWeek.number,
    date: input.date,
    what: input.what,
    evidence: input.evidence,
    ref_code: input.ref_code || null,
  });
  if (insertError) throw new Error(insertError.message);

  await logAppEvent(supabase, "log_created", {
    week_number: entryWeek.number,
    ref_code: input.ref_code || null,
  });

  if (activeWeek && entryWeek.number === activeWeek.number) {
    const state = await loadStreakState(supabase, "weekly_log");
    const result = markPeriod(state, "weekly_log", todayISO);
    await persistStreakResult(supabase, "weekly_log", result);

    if (result.events.some((e) => e.action === "marked")) {
      await logAppEvent(supabase, "streak_marked", { kind: "weekly_log" });
    }
  }

  revalidatePath("/");
  revalidatePath("/log");
}

/** 7.6: agrupa el log por mes y lo compila a markdown (esto genera G9.1). */
export async function compileExpedienteAction(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: entries, error } = await supabase
    .from("log_entries")
    .select("date, what, evidence, ref_code")
    .order("date", { ascending: true });
  if (error) throw new Error(error.message);

  return compileExpedienteMarkdown(entries ?? []);
}
