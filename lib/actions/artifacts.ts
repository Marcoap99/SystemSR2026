"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isPhaseLocked } from "@/lib/domain/phases";
import { logAppEvent } from "@/lib/server/events";
import type { ArtifactStatus } from "@/lib/types";

/**
 * 7.2. La barra del grupo se recalcula sola (revalidatePath) — no hay
 * porcentaje que actualizar a mano (criterio de aceptación #7). Se
 * verifica el bloqueo de fase también acá, no solo en la UI (P5).
 */
export async function updateArtifactStatusAction(code: string, status: ArtifactStatus) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: artifact, error: fetchError } = await supabase
    .from("artifacts")
    .select("*")
    .eq("code", code)
    .single();
  if (fetchError || !artifact) throw new Error("Artefacto no encontrado.");

  const { data: phases, error: phasesError } = await supabase
    .from("phases")
    .select("number, unlocked, unlocked_by_boss");
  if (phasesError) throw new Error(phasesError.message);

  if (isPhaseLocked(artifact.phase_number, phases ?? [])) {
    throw new Error("Este artefacto pertenece a una fase todavía bloqueada.");
  }

  const { error } = await supabase.from("artifacts").update({ status }).eq("code", code);
  if (error) throw new Error(error.message);

  if (status === "done" && artifact.status !== "done") {
    await logAppEvent(supabase, "artifact_done", { code });
  }

  revalidatePath(`/g/${artifact.group_code}`);
  revalidatePath("/");
}
