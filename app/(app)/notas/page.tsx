import { NotesBrowser } from "@/components/notes/NotesBrowser";
import { getNotesData } from "@/lib/data/notes";
import { today } from "@/lib/domain/dates";

export const dynamic = "force-dynamic";

/** V1.3 parche sección 7 — /notas. */
export default async function NotasPage() {
  const data = await getNotesData();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Notas</h1>
        <p className="mt-1 text-sm text-text-muted">Todo lo que escribiste sobre tus recursos de aprendizaje.</p>
      </div>
      <NotesBrowser data={data} todayISO={today()} />
    </div>
  );
}
