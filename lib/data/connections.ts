import { createClient } from "@/lib/supabase/server";
import type { Connection } from "@/lib/types";

function codeNumber(code: string): number {
  const match = code.match(/\d+$/);
  return match ? Number(match[0]) : 0;
}

/** 7.4: las 11 conexiones en orden cronológico (CN1..CN11, tal como las numeró el PRD). */
export async function getConnectionsData(): Promise<Connection[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("connections").select("*");
  return ((data ?? []) as Connection[]).sort((a, b) => codeNumber(a.code) - codeNumber(b.code));
}
