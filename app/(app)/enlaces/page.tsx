import { Card } from "@/components/ui/Card";
import { AddLinkModal } from "@/components/enlaces/AddLinkModal";
import { EnlaceCard } from "@/components/enlaces/EnlaceCard";
import { getEnlacesData } from "@/lib/data/enlaces";

export const dynamic = "force-dynamic";

/** V1.4 parche sección 2 — /enlaces: biblioteca permanente de links fuera del plan. */
export default async function EnlacesPage() {
  const { resources } = await getEnlacesData();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text">Enlaces</h1>
          <p className="mt-1 text-sm text-text-muted">Para ver después.</p>
        </div>
        <AddLinkModal />
      </div>

      {resources.length === 0 ? (
        <Card>
          <p className="text-sm text-text-muted">
            Todavía no guardaste nada. Usá &ldquo;+ Agregar&rdquo; para el primer link.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => (
            <EnlaceCard key={r.id} resource={r} />
          ))}
        </div>
      )}
    </div>
  );
}
