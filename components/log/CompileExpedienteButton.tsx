"use client";

import { useState, useTransition } from "react";
import { compileExpedienteAction } from "@/lib/actions/log";
import { today } from "@/lib/domain/dates";

/** 7.6: agrupa por mes y exporta markdown (esto genera G9.1). */
export function CompileExpedienteButton() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        const markdown = await compileExpedienteAction();
        const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `expediente-${today()}.md`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo compilar el expediente.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="rounded-card bg-secondary px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Compilando…" : "Compilar expediente"}
      </button>
      {error ? <p className="text-sm text-warn">{error}</p> : null}
    </div>
  );
}
