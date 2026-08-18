"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAppEvent } from "@/lib/server/events";
import type { ItemStatus } from "@/lib/types";

/** Bloque A: estado editable de un recurso concreto (no del learn_item). */
export async function updateResourceStatusAction(id: string, status: ItemStatus) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: before } = await supabase.from("resources").select("status").eq("id", id).single();

  const { error } = await supabase.from("resources").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);

  // C.4: el heatmap cuenta esto como actividad del día — pero es sobre
  // producción del sistema (una fecha de actividad), no una condición de
  // insignia (C.3 nunca lee resources).
  if (status === "done" && before?.status !== "done") {
    await logAppEvent(supabase, "resource_done", { id });
  }

  revalidatePath("/aprender");
}

// La nota personal por recurso (antes un textarea acá mismo) vive desde
// V1.3 en lib/actions/notes.ts -- saveResourceNotesAction -- porque
// ahora es un documento BlockNote, no un string.
