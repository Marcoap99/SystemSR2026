"use server";

import { revalidatePath } from "next/cache";
import { createDsClient } from "@/lib/supabase/ds";
import { today } from "@/lib/domain/dates";
import type { Lane } from "@/lib/domain/ds";
import { noteDocumentToPlainText, noteWordCount } from "@/lib/domain/notes";
import type { NoteDocument } from "@/lib/types";

export interface DsResourceSearchResult {
  id: string;
  theme_code: string;
  week: number | null;
  title: string;
  url: string | null;
  notes_plain: string | null;
}

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
  if (!Number.isInteger(week) || week < 1 || week > 10) throw new Error("Semana inválida");
  const db = await authed();
  // Solo las 3 preguntas conocidas: el cliente no puede meter claves arbitrarias en el jsonb.
  const clean = Object.fromEntries(
    (["ok", "stuck", "adjust"] as const).map((k) => [k, String(answers[k] ?? "").slice(0, 600)]),
  );
  const next = nextResults.map((s) => String(s).trim().slice(0, 140)).filter(Boolean).slice(0, 3);
  const { error } = await db
    .from("ds_reviews")
    .upsert({ week, answers: clean, next_results: next }, { onConflict: "user_id,week" });
  if (error) throw new Error(error.message);
  revalidatePath("/domingo");
}

/** Bloque 1 realineación — paridad con saveResourceNotesAction, sobre ds_resources. */
export async function saveDsResourceNotesAction(id: string, doc: NoteDocument) {
  const db = await authed();
  const { error } = await db
    .from("ds_resources")
    .update({
      notes: doc as never,
      notes_plain: noteDocumentToPlainText(doc) || null,
      notes_word_count: noteWordCount(doc),
      notes_updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/ruta");
  revalidatePath("/notas");
}

export async function searchDsNotesAction(query: string): Promise<DsResourceSearchResult[]> {
  const q = query.trim();
  if (!q) return [];
  const db = await authed();
  const { data, error } = await db
    .from("ds_resources")
    .select("id,theme_code,week,title,url,notes_plain")
    .eq("has_notes", true)
    .textSearch("notes_plain", q, { type: "plain", config: "spanish" })
    .limit(50);
  if (error) throw new Error(error.message);
  return (data ?? []) as DsResourceSearchResult[];
}

export async function setDsResourceStatusAction(id: string, status: "pending" | "in_progress" | "done") {
  const db = await authed();
  const { error } = await db.from("ds_resources").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/ruta");
}

export async function logHoursAction(lane: Lane, delta: number) {
  if (!["A", "B", "C"].includes(lane) || !Number.isFinite(delta) || Math.abs(delta) > 8) return;
  const db = await authed();
  const day = today();
  const cur = await db.from("ds_hours_log").select("actual_h").eq("lane", lane).eq("day", day).maybeSingle();
  const next = Math.max(0, Number((cur.data as { actual_h: number } | null)?.actual_h ?? 0) + delta);
  const { error } = await db
    .from("ds_hours_log")
    .upsert({ lane, day, actual_h: next }, { onConflict: "user_id,lane,day" });
  if (error) throw new Error(error.message);
  revalidatePath("/nucleo");
  revalidatePath("/carriles");
}

export type DsConnectionStage = "nuevo" | "contactado" | "conversando" | "reunion" | "cerrado";
const CONNECTION_STAGES: DsConnectionStage[] = ["nuevo", "contactado", "conversando", "reunion", "cerrado"];

/** Bloque 5 realineación — Red. */
export async function addDsConnectionAction(input: {
  persona: string;
  empresa?: string;
  rol?: string;
  canal?: string;
}) {
  const persona = input.persona.trim().slice(0, 140);
  if (!persona) throw new Error("Falta el nombre");
  const db = await authed();
  const { error } = await db.from("ds_connections").insert({
    persona,
    empresa: input.empresa?.trim().slice(0, 140) || null,
    rol: input.rol?.trim().slice(0, 140) || null,
    canal: input.canal?.trim().slice(0, 80) || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/red");
}

export async function setDsConnectionStageAction(id: string, etapa: DsConnectionStage) {
  if (!CONNECTION_STAGES.includes(etapa)) throw new Error("Etapa inválida");
  const db = await authed();
  const { error } = await db.from("ds_connections").update({ etapa }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/red");
}

export async function updateDsConnectionAction(
  id: string,
  patch: { ultimo_contacto?: string | null; proxima_accion?: string | null; nota?: string | null },
) {
  const db = await authed();
  const clean: Record<string, string | null> = {};
  if ("ultimo_contacto" in patch) clean.ultimo_contacto = patch.ultimo_contacto || null;
  if ("proxima_accion" in patch) clean.proxima_accion = (patch.proxima_accion ?? "").trim().slice(0, 200) || null;
  if ("nota" in patch) clean.nota = (patch.nota ?? "").trim().slice(0, 2000) || null;
  const { error } = await db.from("ds_connections").update(clean).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/red");
}

/** Bloque 5 realineación — Evidencia. Mismo editor genérico de notas que ds_resources. */
export async function addDsEvidencePieceAction(input: { title: string; kind: "caso_final" | "portafolio" }) {
  const title = input.title.trim().slice(0, 140);
  if (!title) throw new Error("Falta el título");
  const db = await authed();
  const { count } = await db.from("ds_evidence_pieces").select("id", { count: "exact", head: true });
  const { error } = await db.from("ds_evidence_pieces").insert({ title, kind: input.kind, sort_order: count ?? 0 });
  if (error) throw new Error(error.message);
  revalidatePath("/evidencia");
}

export async function saveDsEvidenceNotesAction(id: string, doc: NoteDocument) {
  const db = await authed();
  const { error } = await db
    .from("ds_evidence_pieces")
    .update({
      notes: doc as never,
      notes_plain: noteDocumentToPlainText(doc) || null,
      notes_word_count: noteWordCount(doc),
      notes_updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/evidencia");
}

export async function setDsEvidenceStatusAction(id: string, status: "pending" | "in_progress" | "done") {
  const db = await authed();
  const { error } = await db.from("ds_evidence_pieces").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/evidencia");
}

export async function setDsEvidenceLinkAction(id: string, url: string) {
  const db = await authed();
  const clean = url.trim().slice(0, 500) || null;
  const { error } = await db.from("ds_evidence_pieces").update({ url: clean }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/evidencia");
}

export async function logHabitAction(habit: "english" | "sql", on: boolean) {
  const db = await authed();
  const day = today();
  if (on) {
    const { error } = await db
      .from("ds_habit_log")
      .upsert({ habit, day, minutes: habit === "english" ? 25 : 30 }, { onConflict: "user_id,habit,day" });
    if (error) throw new Error(error.message);
  } else {
    const { error } = await db.from("ds_habit_log").delete().eq("habit", habit).eq("day", day);
    if (error) throw new Error(error.message);
  }
  revalidatePath("/habitos");
  revalidatePath("/nucleo");
}
