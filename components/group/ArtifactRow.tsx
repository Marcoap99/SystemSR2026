"use client";

import { useState, useTransition } from "react";
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
  // C.5: el check se "dibuja" (stroke-dasharray) solo la primera vez que
  // este componente ve la transición a "done", no en cada carga con el
  // artefacto ya cerrado.
  const [justCompleted, setJustCompleted] = useState(false);

  return (
    <div
      className={
        "flex flex-col gap-2 rounded-card border border-border p-4 sm:flex-row sm:items-center sm:justify-between " +
        // C.5: shake horizontal al pasar el mouse por un ítem bloqueado.
        (locked ? "bg-bg opacity-70 grayscale-[0.4] hover:animate-shake" : "")
      }
      title={locked ? (lockReason ?? undefined) : undefined}
    >
      <div className="flex items-start gap-2">
        {locked ? (
          // C.6: candado visible en vez de solo bajar la opacidad.
          <span className="mt-0.5 shrink-0 text-locked" aria-hidden="true" title={lockReason ?? undefined}>
            🔒
          </span>
        ) : null}
        <div>
          <p className={"text-sm font-semibold " + (locked ? "text-locked" : "text-text")}>
            <span className="font-mono">{artifact.code}</span> — {artifact.title}
          </p>
          {consumedTitles.length > 0 ? (
            <p className="mt-1 text-xs text-text-muted">Consume: {consumedTitles.join(", ")}</p>
          ) : null}
          {artifact.note ? <p className="mt-1 text-xs text-text-muted">{artifact.note}</p> : null}
        </div>
      </div>

      {locked ? (
        <span
          className="w-fit rounded-badge bg-bg px-2 py-1 text-xs font-medium text-locked backdrop-blur-sm"
          title={lockReason ?? undefined}
        >
          {STATUS_TEXT[artifact.status]}
        </span>
      ) : (
        <div className="flex items-center gap-2">
          {artifact.status === "done" ? (
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-brand">
              <path
                className={justCompleted ? "animate-draw-check" : ""}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.3 9.7l3.8 3.8 6.8-6.8"
              />
            </svg>
          ) : null}
          <select
            value={artifact.status}
            disabled={pending}
            onChange={(e) => {
              const next = e.target.value as ArtifactStatus;
              startTransition(() => updateArtifactStatusAction(artifact.code, next));
              if (next === "done" && artifact.status !== "done") setJustCompleted(true);
            }}
            className="w-fit rounded-card border border-border px-2 py-1.5 text-sm text-text outline-none focus:border-brand disabled:opacity-60"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {STATUS_TEXT[status]}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
