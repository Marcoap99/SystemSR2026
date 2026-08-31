import { LearnCodeGroup } from "@/components/learn/LearnCodeGroup";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { LearnCodeGroup as LearnCodeGroupData } from "@/lib/data/learn-items";
import type { GroupProgress } from "@/lib/domain/progress";
import type { LearnTrack } from "@/lib/types";

const TRACK_LABEL: Record<LearnTrack, string> = {
  rol: "A-ROL",
  mercado: "A-MERCADO",
  tool: "A-TOOL",
};

/** Bloque A: una sección por track, con su contador propio (nunca % global). */
export function TrackSection({
  track,
  items,
  progress,
  currentWeekNumber,
}: {
  track: LearnTrack;
  items: LearnCodeGroupData[];
  progress: GroupProgress;
  currentWeekNumber: number | null;
}) {
  const visibleItems = items.filter((g) => g.resources.length > 0);
  if (visibleItems.length === 0) return null;

  return (
    <Card>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-text">{TRACK_LABEL[track]}</h2>
        <div className="flex items-center gap-3 sm:w-64">
          <div className="flex-1">
            <ProgressBar ratio={progress.ratio} showCheck={false} />
          </div>
          <span className="shrink-0 font-mono text-xs text-text-muted tabular-nums">
            {progress.done}/{progress.total}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {visibleItems.map((g) => (
          <LearnCodeGroup
            key={g.item.code}
            item={g.item}
            resources={g.resources}
            progress={g.progress}
            locked={g.locked}
            lockReason={g.lockReason}
            currentWeekNumber={currentWeekNumber}
          />
        ))}
      </div>
    </Card>
  );
}
