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

/** Bloque A: nota personal sobre un recurso (expandible en la tarjeta). */
export async function updateResourceNotesAction(id: string, notes: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase
    .from("resources")
    .update({ notes: notes.trim() === "" ? null : notes })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/aprender");
}
