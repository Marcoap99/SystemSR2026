import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ArtifactRow } from "@/components/group/ArtifactRow";
import { getGroupDetailData } from "@/lib/data/group-detail";
import { isPhaseLocked, lockTooltip } from "@/lib/domain/phases";

export const dynamic = "force-dynamic";

/** 7.2 — detalle de grupo. */
export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const data = await getGroupDetailData(code);

  if (!data.group) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <Link href="/" className="text-sm text-text-muted hover:text-text">
          ← Panel
        </Link>

        <div className="mt-2 flex items-center gap-2">
          <h1 className="text-xl font-semibold text-text">
            {data.group.code} — {data.group.title}
          </h1>
          {data.group.starred ? (
            <span className="text-secondary" title="El más valioso" aria-label="Prioritario">
              ★
            </span>
          ) : null}
        </div>

        <div className="mt-4">
          <ProgressBar ratio={data.progress.ratio} />
        </div>
        <p className="mt-2 text-sm text-text-muted tabular-nums">
          {data.progress.done}/{data.progress.total} artefactos
        </p>

        {data.feedsResults.length > 0 ? (
          <p className="mt-3 text-sm text-text-muted">
            Alimenta: {data.feedsResults.map((r) => `${r.code} — ${r.title}`).join(" · ")}
          </p>
        ) : null}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-text">Artefactos</h2>
        <div className="mt-4 flex flex-col gap-3">
          {data.artifacts.map((artifact) => {
            const locked = isPhaseLocked(artifact.phase_number, data.phases);
            const consumedTitles = artifact.consumes
              .map((c) => data.learnItemsByCode[c]?.title)
              .filter((title): title is string => Boolean(title));

            return (
              <ArtifactRow
                key={artifact.code}
                artifact={artifact}
                consumedTitles={consumedTitles}
                locked={locked}
                lockReason={locked ? lockTooltip(artifact.phase_number, data.phases, data.bosses) : null}
              />
            );
          })}
        </div>
      </Card>
    </div>
  );
}
