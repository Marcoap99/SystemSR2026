import { createClient } from "@/lib/supabase/server";
import { groupProgress, type GroupProgress } from "@/lib/domain/progress";
import { isPhaseLocked, lockTooltip } from "@/lib/domain/phases";
import { dependencyTooltip, isDependencyBlocked, type DoneLookup } from "@/lib/domain/dependencies";
import type { Artifact, ArtifactGroup, Boss, LearnItem, Phase, Result } from "@/lib/types";

export interface ArtifactWithLock {
  artifact: Artifact;
  consumedTitles: string[];
  locked: boolean;
  lockReason: string | null;
}

export interface GroupDetailData {
  group: ArtifactGroup | null;
  artifacts: ArtifactWithLock[];
  progress: GroupProgress;
  feedsResults: Result[];
}

/**
 * 7.2 + V1.2: sub-artefactos, qué aprendizajes consume, a qué resultado
 * alimenta, y si está bloqueado -- por fase (6.6, como siempre) o ahora
 * también por `blocked_by` (V1.2, mismo tratamiento visual). El mapa de
 * "done" para resolver blocked_by cubre TODOS los learn_items y
 * artifacts, no solo los de este grupo -- blocked_by puede apuntar a
 * cualquiera de las dos tablas, de cualquier grupo.
 */
export async function getGroupDetailData(code: string): Promise<GroupDetailData> {
  const supabase = await createClient();

  const [
    { data: group },
    { data: groupArtifacts },
    { data: allArtifacts },
    { data: learnItems },
    { data: results },
    { data: phases },
    { data: bosses },
  ] = await Promise.all([
    supabase.from("artifact_groups").select("*").eq("code", code).maybeSingle(),
    supabase.from("artifacts").select("*").eq("group_code", code).order("code"),
    supabase.from("artifacts").select("code, status"),
    supabase.from("learn_items").select("*"),
    supabase.from("results").select("*"),
    supabase.from("phases").select("*").order("number"),
    supabase.from("bosses").select("*").order("number"),
  ]);

  const learnItemsByCode: Record<string, LearnItem> = {};
  for (const item of learnItems ?? []) learnItemsByCode[item.code] = item;

  const doneByCode: DoneLookup = {};
  for (const item of learnItems ?? []) doneByCode[item.code] = item.status === "done";
  for (const a of allArtifacts ?? []) doneByCode[a.code] = a.status === "done";

  const artifacts: ArtifactWithLock[] = (groupArtifacts ?? []).map((artifact) => {
    const phaseLocked = isPhaseLocked(artifact.phase_number, phases ?? []);
    const depLocked = isDependencyBlocked(artifact.blocked_by, doneByCode);
    const consumedTitles = artifact.consumes
      .map((c) => learnItemsByCode[c]?.title)
      .filter((title): title is string => Boolean(title));

    return {
      artifact,
      consumedTitles,
      locked: phaseLocked || depLocked,
      // Fase primero: si las dos aplican, esa es la explicación más útil
      // (una dependencia sin resolver rara vez importa si la fase entera
      // sigue cerrada).
      lockReason: phaseLocked
        ? lockTooltip(artifact.phase_number, phases ?? [], bosses ?? [])
        : dependencyTooltip(artifact.blocked_by, doneByCode),
    };
  });

  const feedsCodes = group?.feeds ?? [];
  const feedsResults = (results ?? []).filter((r) => feedsCodes.includes(r.code));

  return {
    group: group ?? null,
    artifacts,
    progress: groupProgress(groupArtifacts ?? []),
    feedsResults,
  };
}
