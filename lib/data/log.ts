import { createClient } from "@/lib/supabase/server";
import type { LogEntry } from "@/lib/types";

/** 7.6: todas las entradas del log. */
export async function getAllLogEntries(): Promise<LogEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("log_entries").select("*").order("date", { ascending: false });
  return (data ?? []) as LogEntry[];
}
