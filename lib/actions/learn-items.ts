"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ItemStatus } from "@/lib/types";

/** 7.3: estado editable de un ítem de aprendizaje. */
export async function updateLearnItemStatusAction(code: string, status: ItemStatus) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase.from("learn_items").update({ status }).eq("code", code);
  if (error) throw new Error(error.message);

  revalidatePath("/aprender");
}
