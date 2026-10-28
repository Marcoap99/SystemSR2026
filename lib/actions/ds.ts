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

/** Realineación 21/10 — desglose por carril: cambiar estado (incluye "skipped"). */
export async function setDsTaskStatusAction(id: string, status: "pending" | "done" | "skipped") {
  const db = await authed();
  const { error } = await db.from("ds_tasks").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/nucleo");
  revalidatePath("/carriles");
}

/**
 * Realineación 21/10 — agregar una tarea al backlog de un carril (no es
 * un "resultado del día", sin tope de 3 ni result_rank; day queda null
 * hasta que se le asigne uno).
 */
export async function addLaneTaskAction(lane: Lane, title: string, strategyCode?: string) {
  const clean = title.trim().slice(0, 140);
  if (!clean) return;
  const db = await authed();
  const { error } = await db.from("ds_tasks").insert({ lane, title: clean, strategy_code: strategyCode || null });
  if (error) throw new Error(error.message);
  revalidatePath("/carriles");
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

/** Realineación 20/10 (sección 1) — etiquetas por tema sobre un recurso. */
export async function addDsNoteTagAction(resourceId: string, tag: string) {
  const clean = tag.trim().toLowerCase().slice(0, 40);
  if (!clean) return;
  const db = await authed();
  const { error } = await db.from("ds_note_tags").upsert(
    { resource_id: resourceId, tag: clean },
    { onConflict: "user_id,resource_id,tag" },
  );
  if (error) throw new Error(error.message);
  revalidatePath("/ruta");
}

export async function removeDsNoteTagAction(resourceId: string, tag: string) {
  const db = await authed();
  const { error } = await db.from("ds_note_tags").delete().eq("resource_id", resourceId).eq("tag", tag);
  if (error) throw new Error(error.message);
  revalidatePath("/ruta");
}

export async function setDsResourceStatusAction(id: string, status: "pending" | "in_progress" | "done") {
  const db = await authed();
  const { error } = await db.from("ds_resources").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/ruta");
}

/**
 * Un solo viaje a la base (RPC increment_hours_log, atómico) en vez de
 * leer y después escribir -- los botones +/-0.5h de Núcleo se sentían
 * lentos con el patrón anterior, y además esa ventana entre leer y
 * escribir podía perder un click si se tocaba rápido dos veces seguidas.
 */
export async function logHoursAction(lane: Lane, delta: number): Promise<number> {
  if (!["A", "B", "C", "D"].includes(lane) || !Number.isFinite(delta) || Math.abs(delta) > 8) {
    throw new Error("Valor inválido");
  }
  const db = await authed();
  const { data, error } = await db.rpc("increment_hours_log", { p_lane: lane, p_day: today(), p_delta: delta });
  if (error) throw new Error(error.message);
  revalidatePath("/nucleo");
  revalidatePath("/carriles");
  return Number(data);
}

/**
 * "Estructura por carril" (21/10) -- hasta ahora el contador de Ruta B
 * era de solo lectura, nada escribía ahí. Esto registra la acción real.
 */
export async function addRouteBActionAction(description: string, strategyCode?: string) {
  const clean = description.trim().slice(0, 200);
  if (!clean) throw new Error("Falta la descripción");
  const db = await authed();
  const { error } = await db
    .from("ds_routeb_actions")
    .insert({ description: clean, strategy_code: strategyCode || null });
  if (error) throw new Error(error.message);
  revalidatePath("/nucleo");
  revalidatePath("/carriles");
}

/** Carril B — "Apoyo deal Miami": tope semanal editable (texto libre, "por definir" si queda vacío). */
export async function setMiamiWeeklyCapAction(hours: number | null) {
  const db = await authed();
  const { error } = await db
    .from("ds_lane_info")
    .update({ miami_weekly_cap_h: hours })
    .eq("lane", "B");
  if (error) throw new Error(error.message);
  revalidatePath("/carriles/b");
}

export async function bumpMiamiHoursAction(delta: number): Promise<number> {
  if (!Number.isFinite(delta) || Math.abs(delta) > 8) throw new Error("Valor inválido");
  const db = await authed();
  const { data: row } = await db.from("ds_lane_info").select("miami_hours_logged").eq("lane", "B").maybeSingle();
  const next = Math.max(0, Number((row as { miami_hours_logged: number } | null)?.miami_hours_logged ?? 0) + delta);
  const { error } = await db.from("ds_lane_info").update({ miami_hours_logged: next }).eq("lane", "B");
  if (error) throw new Error(error.message);
  revalidatePath("/carriles/b");
  return next;
}

/** Carril B/D — notas largas del carril (objetivo/estrategia en borrador), mismo editor genérico. */
export async function saveDsLaneNotesAction(lane: Lane, doc: NoteDocument) {
  const db = await authed();
  const { error } = await db
    .from("ds_lane_info")
    .update({
      notes: doc as never,
      notes_plain: noteDocumentToPlainText(doc) || null,
      notes_updated_at: new Date().toISOString(),
    })
    .eq("lane", lane);
  if (error) throw new Error(error.message);
  revalidatePath("/carriles/b");
  revalidatePath("/contenido");
}

export type DsConnectionStage = "nuevo" | "contactado" | "conversando" | "reunion" | "cerrado" | "sin_respuesta";
const CONNECTION_STAGES: DsConnectionStage[] = ["nuevo", "contactado", "conversando", "reunion", "cerrado", "sin_respuesta"];
export type DsConnectionLevel = "A" | "B" | "C";
const CONNECTION_LEVELS: DsConnectionLevel[] = ["A", "B", "C"];

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
  revalidatePath("/red/tech-week");
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

/** 27/10 — Contactos Perú Tech Week: nivel editable desde la tabla. */
export async function setDsConnectionLevelAction(id: string, nivel: DsConnectionLevel | null) {
  if (nivel !== null && !CONNECTION_LEVELS.includes(nivel)) throw new Error("Nivel inválido");
  const db = await authed();
  const { error } = await db.from("ds_connections").update({ nivel }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/red/tech-week");
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

export type DsContentStage = "idea" | "guion" | "grabado" | "editado" | "programado" | "publicado";
const CONTENT_STAGES: DsContentStage[] = ["idea", "guion", "grabado", "editado", "programado", "publicado"];
export type ContentChannel = "reel" | "tiktok" | "carrusel_li";
const CONTENT_CHANNELS: ContentChannel[] = ["reel", "tiktok", "carrusel_li"];
export type ContentPilar = "producto" | "ecosistema" | "ia";
const CONTENT_PILARES: ContentPilar[] = ["producto", "ecosistema", "ia"];

/** Realineación 21/10 — Contenido: una pieza crea una variante por canal elegido. */
export async function addDsContentPieceAction(input: { tema: string; formato?: string; canales?: ContentChannel[]; pilar?: ContentPilar }) {
  const tema = input.tema.trim().slice(0, 140);
  if (!tema) throw new Error("Falta el tema");
  const canales = (input.canales ?? []).filter((c) => CONTENT_CHANNELS.includes(c));
  const pilar = input.pilar && CONTENT_PILARES.includes(input.pilar) ? input.pilar : null;
  const db = await authed();
  const { data, error } = await db
    .from("ds_content_pieces")
    .insert({ tema, formato: input.formato?.trim().slice(0, 60) || null, canales, pilar })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  if (canales.length > 0) {
    const { error: variantsError } = await db
      .from("ds_content_variants")
      .insert(canales.map((channel) => ({ piece_id: data.id, channel })));
    if (variantsError) throw new Error(variantsError.message);
  }
  revalidatePath("/contenido");
}

export async function setDsContentStageAction(id: string, estado: DsContentStage) {
  if (!CONTENT_STAGES.includes(estado)) throw new Error("Estado inválido");
  const db = await authed();
  const { error } = await db.from("ds_content_pieces").update({ estado }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/contenido");
}

/** Variantes por canal: estado y fecha de publicación propios (sección 6 del mensaje). */
export async function setDsContentVariantStageAction(variantId: string, estado: DsContentStage) {
  if (!CONTENT_STAGES.includes(estado)) throw new Error("Estado inválido");
  const db = await authed();
  const patch: { estado: DsContentStage; published_at?: string } = { estado };
  if (estado === "publicado") {
    const { data } = await db.from("ds_content_variants").select("published_at").eq("id", variantId).maybeSingle();
    if (!data?.published_at) patch.published_at = today();
  }
  const { error } = await db.from("ds_content_variants").update(patch).eq("id", variantId);
  if (error) throw new Error(error.message);
  revalidatePath("/contenido");
}

export async function setDsContentVariantDateAction(variantId: string, date: string) {
  const db = await authed();
  const clean = date.trim() || null;
  const { error } = await db.from("ds_content_variants").update({ published_at: clean }).eq("id", variantId);
  if (error) throw new Error(error.message);
  revalidatePath("/contenido");
}

export async function saveDsContentNotesAction(id: string, doc: NoteDocument) {
  const db = await authed();
  const { error } = await db
    .from("ds_content_pieces")
    .update({
      guion_notas: doc as never,
      guion_notas_plain: noteDocumentToPlainText(doc) || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/contenido");
}

export async function setDsContentLinkAction(id: string, link: string) {
  const db = await authed();
  const clean = link.trim().slice(0, 500) || null;
  const { error } = await db.from("ds_content_pieces").update({ link_publicado: clean }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/contenido");
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
