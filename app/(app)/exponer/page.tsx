import { Card } from "@/components/ui/Card";
import { ExposureTypeCard } from "@/components/exponer/ExposureTypeCard";
import { EventHistory } from "@/components/exponer/EventHistory";
import { getExponerData } from "@/lib/data/exponer";

export const dynamic = "force-dynamic";

/** 7.5 — los 4 tipos de exposición + historial. */
export default async function ExponerPage() {
  const { types, events } = await getExponerData();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h1 className="text-xl font-semibold text-text">Exponer</h1>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {types.map((item) => (
            <ExposureTypeCard key={item.exposure.code} item={item} />
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-text">Historial</h2>
        <div className="mt-4">
          <EventHistory events={events} />
        </div>
      </Card>
    </div>
  );
}
