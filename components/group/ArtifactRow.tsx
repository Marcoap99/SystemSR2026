"use client";

import { useTransition } from "react";
import { updateArtifactStatusAction } from "@/lib/actions/artifacts";
import type { Artifact, ArtifactStatus } from "@/lib/types";

const STATUS_OPTIONS: ArtifactStatus[] = ["pending", "in_progress", "done", "blocked"];
const STATUS_TEXT: Record<ArtifactStatus, string> = {
  pending: "Pendiente",
  in_progress: "En curso",
  done: "Hecho",
  blocked: "Bloqueado",
};

/** 7.2: estado editable, salvo que el artefacto esté en una fase bloqueada (6.6). */
export function ArtifactRow({
  artifact,
  consumedTitles,
  locked,
  lockReason,
}: {
  artifact: Artifact;
  consumedTitles: string[];
  locked: boolean;
  lockReason: string | null;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div
      className={
        "flex flex-col gap-2 rounded-card border border-border p-4 sm:flex-row sm:items-center sm:justify-between " +
        (locked ? "opacity-70" : "")
      }
      title={locked ? (lockReason ?? undefined) : undefined}
    >
      <div>
        <p className={"text-sm font-semibold " + (locked ? "text-locked" : "text-text")}>
          {artifact.code} — {artifact.title}
        </p>
        {consumedTitles.length > 0 ? (
          <p className="mt-1 text-xs text-text-muted">Consume: {consumedTitles.join(", ")}</p>
        ) : null}
        {artifact.note ? <p className="mt-1 text-xs text-text-muted">{artifact.note}</p> : null}
      </div>

      {locked ? (
        <span
          className="w-fit rounded-badge bg-bg px-2 py-1 text-xs font-medium text-locked"
          title={lockReason ?? undefined}
        >
          {STATUS_TEXT[artifact.status]}
        </span>
      ) : (
        <select
          value={artifact.status}
          disabled={pending}
          onChange={(e) =>
            startTransition(() =>
              updateArtifactStatusAction(artifact.code, e.target.value as ArtifactStatus),
            )
          }
          className="w-fit rounded-card border border-border px-2 py-1.5 text-sm text-text outline-none focus:border-brand disabled:opacity-60"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {STATUS_TEXT[status]}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
