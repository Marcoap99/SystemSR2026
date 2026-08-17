import { Card } from "@/components/ui/Card";
import { LearnItemRow } from "@/components/learn/LearnItemRow";
import { getLearnItemsData } from "@/lib/data/learn-items";
import type { LearnTrack } from "@/lib/types";

export const dynamic = "force-dynamic";

const TRACK_LABEL: Record<LearnTrack, string> = {
  rol: "A-ROL",
  mercado: "A-MERCADO",
  tool: "A-TOOL",
};

/** 7.3 — los 18 ítems de aprendizaje, agrupados por track. */
export default async function AprenderPage() {
  const { byTrack } = await getLearnItemsData();

  return (
    <div className="flex flex-col gap-6">
      {(Object.keys(TRACK_LABEL) as LearnTrack[]).map((track) => (
        <Card key={track}>
          <h2 className="text-lg font-semibold text-text">{TRACK_LABEL[track]}</h2>
          <div className="mt-4 flex flex-col gap-3">
            {byTrack[track].map((item) => (
              <LearnItemRow key={item.code} item={item} />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
