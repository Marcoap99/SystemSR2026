import { createClient } from "@/lib/supabase/server";
import { groupProgress, type GroupProgress } from "@/lib/domain/progress";
import type { Artifact, ArtifactGroup, Boss, LearnItem, Phase, Result } from "@/lib/types";

export interface GroupDetailData {
  group: ArtifactGroup | null;
  artifacts: Artifact[];
  progress: GroupProgress;
  learnItemsByCode: Record<string, LearnItem>;
  feedsResults: Result[];
  phases: Phase[];
  bosses: Boss[];
}

/** 7.2: sub-artefactos, qué aprendizajes consume, a qué resultado alimenta. */
export async function getGroupDetailData(code: string): Promise<GroupDetailData> {
  const supabase = await createClient();

  const [
    { data: group },
    { data: artifacts },
    { data: learnItems },
    { data: results },
    { data: phases },
    { data: bosses },
  ] = await Promise.all([
    supabase.from("artifact_groups").select("*").eq("code", code).maybeSingle(),
    supabase.from("artifacts").select("*").eq("group_code", code).order("code"),
    supabase.from("learn_items").select("*"),
    supabase.from("results").select("*"),
    supabase.from("phases").select("*").order("number"),
    supabase.from("bosses").select("*").order("number"),
  ]);

  const learnItemsByCode: Record<string, LearnItem> = {};
  for (const item of learnItems ?? []) learnItemsByCode[item.code] = item;

  const feedsCodes = group?.feeds ?? [];
  const feedsResults = (results ?? []).filter((r) => feedsCodes.includes(r.code));

  return {
    group: group ?? null,
    artifacts: (artifacts ?? []) as Artifact[],
    progress: groupProgress(artifacts ?? []),
    learnItemsByCode,
    feedsResults,
    phases: (phases ?? []) as Phase[],
    bosses: (bosses ?? []) as Boss[],
  };
}
