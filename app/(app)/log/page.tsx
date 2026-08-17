import { Card } from "@/components/ui/Card";
import { LogTable } from "@/components/log/LogTable";
import { CompileExpedienteButton } from "@/components/log/CompileExpedienteButton";
import { NewLogEntryModal } from "@/components/dashboard/NewLogEntryModal";
import { getAllLogEntries } from "@/lib/data/log";

export const dynamic = "force-dynamic";

/** 7.6 — log completo + compilar expediente. */
export default async function LogPage() {
  const entries = await getAllLogEntries();

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-text">Log</h1>
        <div className="flex items-center gap-2">
          <NewLogEntryModal />
          <CompileExpedienteButton />
        </div>
      </div>

      <div className="mt-4">
        <LogTable entries={entries} />
      </div>
    </Card>
  );
}
