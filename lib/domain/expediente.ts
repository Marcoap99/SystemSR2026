/**
 * 7.6 / G9.1: compila el log agrupado por mes en markdown. Función pura
 * (recibe las entradas, devuelve texto) para poder testearla sin tocar
 * la base ni el navegador.
 */
import { monthYearLabelEs } from "./dates";

export interface LogEntryLike {
  date: string;
  what: string;
  evidence: string;
  ref_code: string | null;
}

export function compileExpedienteMarkdown(entries: LogEntryLike[]): string {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  const groups = new Map<string, LogEntryLike[]>();
  for (const entry of sorted) {
    const key = entry.date.slice(0, 7); // 'YYYY-MM' — Map conserva el orden de inserción
    const list = groups.get(key) ?? [];
    list.push(entry);
    groups.set(key, list);
  }

  const lines: string[] = ["# Expediente — Log de evidencia", ""];

  if (sorted.length === 0) {
    lines.push("_Sin entradas todavía._");
    return lines.join("\n");
  }

  for (const [key, groupEntries] of groups) {
    lines.push(`## ${monthYearLabelEs(`${key}-01`)}`, "");
    for (const entry of groupEntries) {
      lines.push(`- **${entry.date}** — ${entry.what}`);
      lines.push(`  Evidencia: ${entry.evidence}`);
      if (entry.ref_code) lines.push(`  Ref: ${entry.ref_code}`);
      lines.push("");
    }
  }

  return lines.join("\n");
}
