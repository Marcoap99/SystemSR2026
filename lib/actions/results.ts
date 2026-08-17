"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAppEvent } from "@/lib/server/events";
import { createLogEntryAction } from "./log";

/**
 * 6.4: marcar un sello exige fecha + una nota de evidencia, que se
 * guarda como log_entry (lo que además puede marcar la racha semanal
 * vía createLogEntryAction si cae en la semana en curso).
 */
export async function achieveResultAction(code: string, achievedAt: string, evidence: string) {
  if (!evidence.trim()) throw new Error("La nota de evidencia es obligatoria.");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: result, error: fetchError } = await supabase
    .from("results")
    .select("*")
    .eq("code", code)
    .single();
  if (fetchError || !result) throw new Error("Resultado no encontrado.");

  const { error: updateError } = await supabase
    .from("results")
    .update({ achieved: true, achieved_at: achievedAt })
    .eq("code", code);
  if (updateError) throw new Error(updateError.message);

  await logAppEvent(supabase, "result_achieved", { code });

  await createLogEntryAction({
    date: achievedAt,
    what: `Resultado logrado: ${result.title}`,
    evidence,
    ref_code: code,
  });

  revalidatePath("/");
}
