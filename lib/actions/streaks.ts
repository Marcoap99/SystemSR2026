"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { today } from "@/lib/domain/dates";
import { applyFreeze, markPeriod, type StreakKind } from "@/lib/domain/streaks";
import { loadStreakState, persistStreakResult } from "@/lib/server/streak-io";

async function requireUser(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
}

/** Botón "Marcar hoy" de daily_english. */
export async function markStreakAction(kind: StreakKind) {
  const supabase = await createClient();
  await requireUser(supabase);

  const state = await loadStreakState(supabase, kind);
  const result = markPeriod(state, kind, today());
  await persistStreakResult(supabase, kind, result);

  revalidatePath("/");
}

/** Botón "Usar freeze". Si no aplica (nada saltado o sin cupo), no hace nada. */
export async function freezeStreakAction(kind: StreakKind) {
  const supabase = await createClient();
  await requireUser(supabase);

  const state = await loadStreakState(supabase, kind);
  const result = applyFreeze(state, kind, today());

  if ("error" in result) {
    // El botón ya debería estar deshabilitado en este caso — no-op defensivo.
    return;
  }

  await persistStreakResult(supabase, kind, result);
  revalidatePath("/");
}
