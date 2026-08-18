import { LibraryBrowser } from "@/components/learn/LibraryBrowser";
import { getLearnItemsData } from "@/lib/data/learn-items";

export const dynamic = "force-dynamic";

/** Bloque A (V1.1) — biblioteca de recursos, agrupada por track/learn_code. */
export default async function AprenderPage() {
  const data = await getLearnItemsData();

  return <LibraryBrowser data={data} />;
}
