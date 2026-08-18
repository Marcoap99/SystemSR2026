import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ArtifactRow } from "@/components/group/ArtifactRow";
import { getGroupDetailData } from "@/lib/data/group-detail";

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
            <span className="font-mono">{data.group.code}</span> — {data.group.title}
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
        <p className="mt-2 font-mono text-sm text-text-muted tabular-nums">
          {data.progress.done}/{data.progress.total} artefactos
        </p>

        {data.feedsResults.length > 0 ? (
          <p className="mt-3 text-sm text-text-muted">
            Alimenta: {data.feedsResults.map((r) => `${r.code} — ${r.title}`).join(" · ")}
          </p>
        ) : null}

        {/* V1.2: nota fija del grupo (p. ej. G10 explicando por qué G10.4 es el diferencial). */}
        {data.group.note ? <p className="mt-3 text-sm text-text-muted italic">{data.group.note}</p> : null}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-text">Artefactos</h2>
        <div className="mt-4 flex flex-col gap-3">
          {data.artifacts.map(({ artifact, consumedTitles, locked, lockReason }) => (
            <ArtifactRow
              key={artifact.code}
              artifact={artifact}
              consumedTitles={consumedTitles}
              locked={locked}
              lockReason={lockReason}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
