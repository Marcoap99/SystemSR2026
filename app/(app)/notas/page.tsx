import Link from "next/link";
import { NotesBrowser } from "@/components/notes/NotesBrowser";
import { getNotesData } from "@/lib/data/notes";
import { today } from "@/lib/domain/dates";

export const dynamic = "force-dynamic";

/** V1.3 parche sección 7 — /notas. */
export default async function NotasPage() {
  const data = await getNotesData();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text">Notas</h1>
          <p className="mt-1 text-sm text-text-muted">Todo lo que escribiste sobre tus recursos de aprendizaje.</p>
        </div>
        {/* V1.4: el alta de un recurso libre vive en /enlaces -- acá solo un atajo, para no tener que salir a navegar. */}
        <Link
          href="/enlaces"
          className="shrink-0 rounded-card border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-2"
        >
          + Guardar algo
        </Link>
      </div>
      <NotesBrowser data={data} todayISO={today()} />
    </div>
  );
}
