"use server";

import { revalidatePath } from "next/cache";
import { createDsClient } from "@/lib/supabase/ds";
import { today } from "@/lib/domain/dates";
import type { Lane } from "@/lib/domain/ds";

async function authed() {
  const db = await createDsClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return db;
}

export async function toggleDsTaskAction(id: string, done: boolean) {
  const db = await authed();
  const { error } = await db.from("ds_tasks").update({ status: done ? "done" : "pending" }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/nucleo");
}

export async function addDsResultAction(lane: Lane, title: string) {
  const clean = title.trim().slice(0, 140);
  if (!clean) return;
  const db = await authed();
  const day = today();
  const { count } = await db.from("ds_tasks").select("id", { count: "exact", head: true }).eq("day", day);
  if ((count ?? 0) >= 3) throw new Error("Máximo 3 resultados por día");
  const { error } = await db
    .from("ds_tasks")
    .insert({ lane, title: clean, day, result_rank: (count ?? 0) + 1 });
  if (error) throw new Error(error.message);
  revalidatePath("/nucleo");
}

export async function logEnglishAction() {
  const db = await authed();
  const { error } = await db
    .from("ds_habit_log")
    .upsert({ habit: "english", day: today(), minutes: 25 }, { onConflict: "user_id,habit,day" });
  if (error) throw new Error(error.message);
  revalidatePath("/nucleo");
}

/** Día mínimo viable: queda registrado como evento de Jarvis (no toca app_events). */
export async function minimumViableDayAction() {
  const db = await authed();
  const { error } = await db.from("ds_jarvis_events").insert({ kind: "minimum_viable_day", payload: { day: today() } });
  if (error) throw new Error(error.message);
  revalidatePath("/nucleo");
}

export async function saveReviewAction(week: number, answers: Record<string, string>, nextResults: string[]) {
  const db = await authed();
  const clean = Object.fromEntries(Object.entries(answers).map(([k, v]) => [k, v.slice(0, 600)]));
  const next = nextResults.map((s) => s.trim().slice(0, 140)).filter(Boolean).slice(0, 3);
  const { error } = await db
    .from("ds_reviews")
    .upsert({ week, answers: clean, next_results: next }, { onConflict: "user_id,week" });
  if (error) throw new Error(error.message);
  revalidatePath("/domingo");
}

export async function setDsResourceStatusAction(id: string, status: "pending" | "in_progress" | "done") {
  const db = await authed();
  const { error } = await db.from("ds_resources").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/ruta");
}
