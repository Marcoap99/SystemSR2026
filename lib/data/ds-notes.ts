import { createDsClient } from "@/lib/supabase/ds";
import type { NoteDocument } from "@/lib/types";

export interface DsNoteItem {
  id: string;
  title: string;
  url: string | null;
  themeCode: string;
  themeTitle: string;
  week: number | null;
  status: "pending" | "in_progress" | "done";
  notes: NoteDocument | null;
  notesPlain: string | null;
  notesWordCount: number;
  notesUpdatedAt: string | null;
}

export interface DsNotesData {
  items: DsNoteItem[];
  hasAnyNotes: boolean;
}

/**
 * Bloque 2 realineación — paralela a getNotesData(), pero sobre
 * ds_resources. No toca la función ni la tabla vieja: Notas muestra esto
 * arriba, y lo de siempre queda colapsado debajo (NotesBrowser).
 */
export async function getDsNotesData(): Promise<DsNotesData> {
  const db = await createDsClient();
  const [{ data: resources }, { data: themes }] = await Promise.all([
    db
      .from("ds_resources")
      .select("id,title,url,theme_code,week,status,notes,notes_plain,notes_word_count,notes_updated_at")
      .eq("has_notes", true)
      .order("notes_updated_at", { ascending: false }),
    db.from("ds_study_themes").select("code,title"),
  ]);

  const titleByCode = new Map(((themes ?? []) as { code: string; title: string }[]).map((t) => [t.code, t.title]));

  const items: DsNoteItem[] = ((resources ?? []) as {
    id: string;
    title: string;
    url: string | null;
    theme_code: string;
    week: number | null;
    status: "pending" | "in_progress" | "done";
    notes: NoteDocument | null;
    notes_plain: string | null;
    notes_word_count: number;
    notes_updated_at: string | null;
  }[]).map((r) => ({
    id: r.id,
    title: r.title,
    url: r.url,
    themeCode: r.theme_code,
    themeTitle: titleByCode.get(r.theme_code) ?? r.theme_code,
    week: r.week,
    status: r.status,
    notes: r.notes,
    notesPlain: r.notes_plain,
    notesWordCount: r.notes_word_count,
    notesUpdatedAt: r.notes_updated_at,
  }));

  return { items, hasAnyNotes: items.length > 0 };
}
