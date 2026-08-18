import { createClient } from "@/lib/supabase/server";
import { today } from "@/lib/domain/dates";
import { currentWeek } from "@/lib/domain/weeks";
import { groupProgress, type GroupProgress } from "@/lib/domain/progress";
import { dependencyTooltip, isDependencyBlocked, type DoneLookup } from "@/lib/domain/dependencies";
import type { LearnItem, LearnTrack, Resource, ResourceFormat, Week } from "@/lib/types";

/** Desempate de prioridad iguales: por el número del código (AR1, AR2, ..., AR10). */
function codeNumber(code: string): number {
  const match = code.match(/\d+$/);
  return match ? Number(match[0]) : 0;
}

export interface LearnCodeGroup {
  item: LearnItem;
  resources: Resource[];
  progress: GroupProgress;
  locked: boolean;
  lockReason: string | null;
}

export interface TrackGroup {
  track: LearnTrack;
  items: LearnCodeGroup[];
  progress: GroupProgress;
}

export interface LearnItemsData {
  todayISO: string;
  currentWeekNumber: number | null;
  tracks: TrackGroup[];
  weeksWithResources: number[];
  formatsPresent: ResourceFormat[];
}

const TRACK_ORDER: LearnTrack[] = ["rol", "mercado", "tool"];

/**
 * Bloque A (V1.1) + V1.2: biblioteca de recursos, agrupada por track y
 * luego por learn_code, ordenada por `priority` dentro de cada track
 * (V1.2 criterio de aceptación #1). `blocked_by` siempre apunta a otro
 * learn_item (el schema le puso FK), así que el mapa de "done" para
 * resolverlo sale de los propios learn_items, sin tocar artifacts.
 */
export async function getLearnItemsData(): Promise<LearnItemsData> {
  const supabase = await createClient();
  const todayISO = today();

  const [{ data: items }, { data: resources }, { data: weeks }] = await Promise.all([
    supabase.from("learn_items").select("*"),
    supabase.from("resources").select("*").order("sort_order"),
    supabase.from("weeks").select("*").order("number"),
  ]);

  const weekRow = currentWeek((weeks ?? []) as Week[], todayISO);
  const currentWeekNumber = weekRow?.number ?? null;

  const doneByCode: DoneLookup = {};
  for (const item of items ?? []) doneByCode[item.code] = item.status === "done";

  const resourcesByCode = new Map<string, Resource[]>();
  for (const resource of resources ?? []) {
    const list = resourcesByCode.get(resource.learn_code) ?? [];
    list.push(resource);
    resourcesByCode.set(resource.learn_code, list);
  }

  const itemsByTrack: Record<LearnTrack, LearnItem[]> = { rol: [], mercado: [], tool: [] };
  for (const item of items ?? []) {
    itemsByTrack[item.track].push(item);
  }
  for (const track of TRACK_ORDER) {
    itemsByTrack[track].sort(
      (a, b) => a.priority - b.priority || codeNumber(a.code) - codeNumber(b.code),
    );
  }

  const tracks: TrackGroup[] = TRACK_ORDER.map((track) => {
    const groups: LearnCodeGroup[] = itemsByTrack[track].map((item) => {
      const itemResources = resourcesByCode.get(item.code) ?? [];
      return {
        item,
        resources: itemResources,
        progress: groupProgress(itemResources),
        locked: isDependencyBlocked(item.blocked_by, doneByCode),
        lockReason: dependencyTooltip(item.blocked_by, doneByCode),
      };
    });
    const trackResources = groups.flatMap((g) => g.resources);
    return { track, items: groups, progress: groupProgress(trackResources) };
  });

  const weeksWithResources = Array.from(
    new Set((resources ?? []).map((r) => r.week).filter((w): w is number => w !== null)),
  ).sort((a, b) => a - b);

  const formatsPresent = Array.from(new Set((resources ?? []).map((r) => r.format))).sort();

  return { todayISO, currentWeekNumber, tracks, weeksWithResources, formatsPresent };
}
