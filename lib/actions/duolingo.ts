"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireUser(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return user;
}

/**
 * V1.7 — conectar/desconectar el username público de Duolingo. Pasar
 * null desconecta (el sync deja de correr, pero conserva el último
 * streak visto por si se reconecta). upsert porque la fila puede no
 * existir todavía (primera vez que este usuario toca el ajuste).
 */
export async function saveDuolingoUsernameAction(username: string | null) {
  const supabase = await createClient();
  const user = await requireUser(supabase);

  const trimmed = username?.trim() || null;

  const { error } = await supabase
    .from("user_settings")
    .upsert({ user_id: user.id, duolingo_username: trimmed }, { onConflict: "user_id" });
  if (error) throw new Error(error.message);

  revalidatePath("/");
}
