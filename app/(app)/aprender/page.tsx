import { LibraryBrowser } from "@/components/learn/LibraryBrowser";
import { getLearnItemsData } from "@/lib/data/learn-items";

export const dynamic = "force-dynamic";

/**
 * Bloque A (V1.1) — biblioteca de recursos, agrupada por track/learn_code.
 * Realineación bloque 1: ya no es una pestaña de Aprender (Núcleo), se
 * llega acá desde la carpeta "Temporada 1" de Notas (bloque 2).
 */
export default async function AprenderPage() {
  const data = await getLearnItemsData();

  return (
    <div className="flex flex-col gap-4">
      <LibraryBrowser data={data} />
    </div>
  );
}
