import { createClient } from "@/lib/supabase/server";
import { today } from "@/lib/domain/dates";
import { capReached, countInMonth, exposureSummaryText } from "@/lib/domain/exposures";
import type { Exposure, ExposureEvent } from "@/lib/types";

export interface ExposureWithCount {
  exposure: Exposure;
  monthCount: number;
  summaryText: string;
  capReached: boolean;
}

export interface ExponerData {
  types: ExposureWithCount[];
  events: ExposureEvent[];
}

/** 7.5: los 4 tipos + historial. Conteo mensual siempre en texto (P9), nunca "n/máximo". */
export async function getExponerData(): Promise<ExponerData> {
  const supabase = await createClient();
  const todayISO = today();

  const [{ data: exposures }, { data: events }] = await Promise.all([
    supabase.from("exposures").select("*").order("code"),
    supabase.from("exposure_events").select("*").order("date", { ascending: false }),
  ]);

  const types: ExposureWithCount[] = (exposures ?? []).map((exposure) => {
    const ownEvents = (events ?? []).filter((e) => e.exposure_code === exposure.code);
    const monthCount = countInMonth(ownEvents, todayISO);
    return {
      exposure,
      monthCount,
      summaryText: exposureSummaryText(monthCount, todayISO),
      capReached: capReached(monthCount, exposure.cap_per_month),
    };
  });

  return { types, events: (events ?? []) as ExposureEvent[] };
}
