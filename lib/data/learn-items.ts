import { createClient } from "@/lib/supabase/server";
import type { LearnItem, LearnTrack } from "@/lib/types";

/** Orden natural por el número del código (AR1, AR2, ..., AR10 — no alfabético). */
function codeNumber(code: string): number {
  const match = code.match(/\d+$/);
  return match ? Number(match[0]) : 0;
}

export interface LearnItemsData {
  byTrack: Record<LearnTrack, LearnItem[]>;
}

const TRACK_ORDER: LearnTrack[] = ["rol", "mercado", "tool"];

/** 7.3: los 18 ítems agrupados por track. */
export async function getLearnItemsData(): Promise<LearnItemsData> {
  const supabase = await createClient();
  const { data: items } = await supabase.from("learn_items").select("*");

  const byTrack: Record<LearnTrack, LearnItem[]> = { rol: [], mercado: [], tool: [] };
  for (const item of items ?? []) {
    byTrack[item.track].push(item);
  }
  for (const track of TRACK_ORDER) {
    byTrack[track].sort((a, b) => codeNumber(a.code) - codeNumber(b.code));
  }

  return { byTrack };
}
