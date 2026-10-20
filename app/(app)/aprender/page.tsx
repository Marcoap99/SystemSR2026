import { LibraryBrowser } from "@/components/learn/LibraryBrowser";
import { AprenderTabs } from "@/components/nucleo/AprenderTabs";
import { getLearnItemsData } from "@/lib/data/learn-items";

export const dynamic = "force-dynamic";

/** Bloque A (V1.1) — biblioteca de recursos, agrupada por track/learn_code. */
export default async function AprenderPage() {
  const data = await getLearnItemsData();

  return (
    <div className="flex flex-col gap-4">
      <AprenderTabs active="/aprender" />
      <LibraryBrowser data={data} />
    </div>
  );
}
