/**
 * V1.3 — funciones puras sobre un documento de notas (BlockNote). Cero
 * dependencia del editor real: reciben `unknown` y navegan la forma
 * genérica {content, children} para que se puedan testear con objetos
 * planos y para que la migración SQL y el editor real converjan al
 * mismo contrato sin acoplarse entre sí.
 */

function extractText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const obj = node as Record<string, unknown>;
  let text = typeof obj.text === "string" ? obj.text : "";
  if (Array.isArray(obj.content)) {
    text += obj.content.map(extractText).join("");
  }
  if (Array.isArray(obj.children) && obj.children.length > 0) {
    text += (text ? "\n" : "") + obj.children.map(extractText).join("\n");
  }
  return text;
}

/** Texto plano del documento, un bloque por línea. Usado por notes_plain (búsqueda full-text). */
export function noteDocumentToPlainText(doc: unknown): string {
  if (!Array.isArray(doc)) return "";
  return doc
    .map(extractText)
    .filter((line) => line.trim() !== "")
    .join("\n")
    .trim();
}

/** Cantidad de palabras del documento. 0 para un documento vacío o recién plantillado sin llenar. */
export function noteWordCount(doc: unknown): number {
  const text = noteDocumentToPlainText(doc);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}
