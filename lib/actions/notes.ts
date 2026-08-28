"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { noteDocumentToPlainText, noteWordCount } from "@/lib/domain/notes";
import type { NoteDocument, Resource } from "@/lib/types";

export interface NoteSearchResult {
  resource: Resource;
  matchIndex: number;
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

/**
 * V1.3 — autosave del modal de notas (parche sección 2). Recibe el
 * documento BlockNote tal cual, y deriva notes_plain/notes_word_count acá
 * (capa de servidor, no en el cliente) para que ambos queden siempre
 * consistentes con lo que se guardó.
 */
export async function saveResourceNotesAction(resourceId: string, doc: NoteDocument) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase
    .from("resources")
    .update({
      notes: doc as never,
      notes_plain: noteDocumentToPlainText(doc) || null,
      notes_word_count: noteWordCount(doc),
      notes_updated_at: new Date().toISOString(),
    })
    .eq("id", resourceId);
  if (error) throw new Error(error.message);

  revalidatePath("/aprender");
  revalidatePath("/notas");
}

/**
 * V1.3 — sube una captura pegada al bucket privado 'notas' (parche
 * sección 4) y devuelve una signed URL de larga duración (1 año, como
 * pide el parche -- el bucket no es público). Corre en el server action
 * (no en el cliente) para reusar el cliente de Supabase ya autenticado
 * por cookie y validar tamaño/tipo antes de gastar el upload.
 *
 * Todo el cuerpo va envuelto en try/catch: sin esto, cualquier excepción
 * no controlada (ej. un corte de red hacia Supabase a mitad del upload)
 * se escapa del server action sin pasar por los `return { error }` de
 * abajo. Next no puede empaquetar esa excepción como respuesta RSC válida
 * y el cliente termina mostrando su propio mensaje genérico en inglés
 * ("An unexpected response was received from the server") en vez del
 * motivo real -- que es justo el bug que reportó el usuario.
 */
export async function uploadNoteImageAction(
  resourceId: string,
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "No autenticado" };

    const file = formData.get("file");
    if (!(file instanceof File)) return { error: "Archivo inválido" };
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) return { error: "Tipo de archivo no permitido" };
    if (file.size > MAX_IMAGE_BYTES) return { error: "La imagen supera los 5 MB" };

    const ext = EXT_BY_TYPE[file.type] ?? "bin";
    const path = `${user.id}/${resourceId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("notas")
      .upload(path, file, { contentType: file.type });
    if (uploadError) return { error: uploadError.message };

    // 1 año, como pide el parche ("expiración larga").
    const { data: signed, error: signError } = await supabase.storage
      .from("notas")
      .createSignedUrl(path, 60 * 60 * 24 * 365);
    if (signError || !signed) return { error: signError?.message ?? "No se pudo firmar la URL" };

    return { url: signed.signedUrl };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error de red al subir la imagen" };
  }
}

/**
 * V1.3 parche sección 7 — búsqueda full-text de /notas, sobre el texto
 * plano guardado en notes_plain (índice GIN, migración V1.3). PostgREST
 * no expone un `order by ts_rank(...)` genérico desde el cliente, así
 * que el orden "por relevancia" se aproxima acá con la cantidad de
 * apariciones del término en cada nota -- server action porque
 * necesita el cliente de Supabase autenticado por cookie.
 */
export async function searchNotesAction(query: string): Promise<NoteSearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("has_notes", true)
    .textSearch("notes_plain", q, { type: "plain", config: "spanish" })
    .limit(50);
  if (error) throw new Error(error.message);

  const needle = q.toLowerCase();
  const results = (data ?? [])
    .map((row) => {
      const resource = row as Resource;
      const plain = (resource.notes_plain ?? "").toLowerCase();
      const matchIndex = plain.indexOf(needle);
      const occurrences = matchIndex === -1 ? 0 : plain.split(needle).length - 1;
      return { resource, matchIndex, occurrences };
    })
    .sort((a, b) => b.occurrences - a.occurrences)
    .map(({ resource, matchIndex }) => ({ resource, matchIndex }));

  return results;
}
