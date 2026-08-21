import { createClient } from "@/lib/supabase/server";
import { today } from "@/lib/domain/dates";
import { currentWeek } from "@/lib/domain/weeks";
import type { Resource, Week } from "@/lib/types";

export interface NotesByWeekGroup {
  week: number | null;
  resources: Resource[];
}

export interface NotesByTopicGroup {
  learnCode: string;
  learnTitle: string;
  priority: number;
  // V1.4: true para el bucket "Sin plan" (recursos libres, sin learn_item).
  isFree: boolean;
  resources: Resource[];
}

// Clave interna para agrupar los recursos libres (learn_code null) en
// "Por tema" -- nunca se persiste, solo vive en esta función.
const FREE_BUCKET_KEY = "SIN_PLAN";

export interface NotesData {
  byWeek: NotesByWeekGroup[];
  byTopic: NotesByTopicGroup[];
  hasAnyNotes: boolean;
  currentWeekNumber: number | null;
}

/**
 * V1.3 parche sección 7 — /notas: todas las notas de aprendizaje en un
 * solo lugar, agrupadas por semana (descendente) o por tema (orden de
 * `priority` del learn_item, igual que /aprender desde V1.2). Solo
 * entran recursos con has_notes=true -- la columna generada del parche,
 * nunca resources sin nota.
 */
export async function getNotesData(): Promise<NotesData> {
  const supabase = await createClient();

  const [{ data: resources }, { data: items }, { data: weeks }] = await Promise.all([
    supabase.from("resources").select("*").eq("has_notes", true).order("notes_updated_at", { ascending: false }),
    supabase.from("learn_items").select("code, title, priority"),
    supabase.from("weeks").select("*").order("number"),
  ]);

  const weekRow = currentWeek((weeks ?? []) as Week[], today());
  const itemByCode = new Map((items ?? []).map((i) => [i.code, i]));

  const weekMap = new Map<number, Resource[]>();
  const noWeek: Resource[] = [];
  for (const r of (resources ?? []) as Resource[]) {
    if (r.week === null) {
      noWeek.push(r);
      continue;
    }
    const list = weekMap.get(r.week) ?? [];
    list.push(r);
    weekMap.set(r.week, list);
  }
  const byWeek: NotesByWeekGroup[] = [
    ...Array.from(weekMap.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([week, list]) => ({ week, resources: list })),
    ...(noWeek.length > 0 ? [{ week: null, resources: noWeek }] : []),
  ];

  const topicMap = new Map<string, Resource[]>();
  for (const r of (resources ?? []) as Resource[]) {
    const key = r.learn_code ?? FREE_BUCKET_KEY;
    const list = topicMap.get(key) ?? [];
    list.push(r);
    topicMap.set(key, list);
  }
  const byTopic: NotesByTopicGroup[] = Array.from(topicMap.entries())
    .map(([code, list]) => {
      if (code === FREE_BUCKET_KEY) {
        return { learnCode: code, learnTitle: "Sin plan", priority: Infinity, isFree: true, resources: list };
      }
      const item = itemByCode.get(code);
      return {
        learnCode: code,
        learnTitle: item?.title ?? code,
        priority: item?.priority ?? 999,
        isFree: false,
        resources: list,
      };
    })
    .sort((a, b) => a.priority - b.priority);

  return {
    byWeek,
    byTopic,
    hasAnyNotes: (resources ?? []).length > 0,
    currentWeekNumber: weekRow?.number ?? null,
  };
}
