"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** 7.4: marcar una conexión como done EXIGE llenar unlocked_note. */
export async function markConnectionDoneAction(code: string, unlockedNote: string) {
  if (!unlockedNote.trim()) {
    throw new Error("Contá qué desbloqueó realmente — el campo es obligatorio.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase
    .from("connections")
    .update({ status: "done", unlocked_note: unlockedNote })
    .eq("code", code);
  if (error) throw new Error(error.message);

  revalidatePath("/conectar");
}
