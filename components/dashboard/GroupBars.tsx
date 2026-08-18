import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CountUp } from "@/components/ui/CountUp";
import { GroupCompleteConfetti } from "@/components/dashboard/GroupCompleteConfetti";
import type { GroupProgress } from "@/lib/domain/progress";
import type { ArtifactGroup } from "@/lib/types";

/** 7.1 (5): 9 filas — código, título, barra, n/total. G3 con estrella. */
export function GroupBars({
  groups,
}: {
  groups: Array<{ group: ArtifactGroup; progress: GroupProgress }>;
}) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-text">Barras</h2>
      <div className="mt-3 flex flex-col divide-y divide-border">
        {groups.map(({ group, progress }) => (
          <Link
            key={group.code}
            href={`/g/${group.code}`}
            className="relative flex flex-col gap-2 py-3 transition-colors hover:bg-bg sm:flex-row sm:items-center sm:gap-4"
          >
            <GroupCompleteConfetti groupCode={group.code} complete={progress.ratio >= 1} />
            <span className="w-14 shrink-0 font-mono text-sm font-semibold text-text-muted">
              {group.code}
            </span>
            <span className="text-sm text-text sm:w-56 sm:shrink-0 sm:truncate">
              {group.title}
              {group.starred ? (
                <span className="ml-1 text-secondary" aria-label="Prioritario" title="El más valioso">
                  ★
                </span>
              ) : null}
            </span>
            <div className="flex-1">
              <ProgressBar ratio={progress.ratio} />
            </div>
            <span className="w-16 shrink-0 font-mono text-sm text-text-muted tabular-nums sm:text-right">
              <CountUp value={progress.done} />/{progress.total}
            </span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
