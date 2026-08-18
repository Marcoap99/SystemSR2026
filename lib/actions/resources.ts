"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ItemStatus } from "@/lib/types";

/** Bloque A: estado editable de un recurso concreto (no del learn_item). */
export async function updateResourceStatusAction(id: string, status: ItemStatus) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase.from("resources").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);

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
