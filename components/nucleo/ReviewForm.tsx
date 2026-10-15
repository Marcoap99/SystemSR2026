"use client";

import { useState, useTransition } from "react";
import { saveReviewAction } from "@/lib/actions/ds";

const QUESTIONS = [
  { key: "ok", label: "Qué salió bien" },
  { key: "stuck", label: "Qué me trabó" },
  { key: "adjust", label: "Un ajuste para la próxima semana" },
] as const;

export function ReviewForm({
  week,
  initial,
}: {
  week: number;
  initial: { answers: Record<string, string>; next_results: string[] } | null;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>(initial?.answers ?? {});
  const [next, setNext] = useState<string[]>([...(initial?.next_results ?? []), "", "", ""].slice(0, 3));
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(false);
        start(async () => {
          await saveReviewAction(week, answers, next);
          setSaved(true);
        });
      }}
    >
      {QUESTIONS.map((q) => (
        <label key={q.key} className="flex flex-col gap-1 text-sm text-text">
          {q.label}
          <textarea
            value={answers[q.key] ?? ""}
            maxLength={600}
            onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.value })}
            className="min-h-20 rounded-card border border-border bg-surface px-3 py-2 outline-none focus:border-brand"
          />
        </label>
      ))}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm text-text">3 resultados de la próxima semana</legend>
        {next.map((v, i) => (
          <input
            key={i}
            aria-label={`Resultado ${i + 1}`}
            value={v}
            maxLength={140}
            onChange={(e) => setNext(next.map((x, j) => (j === i ? e.target.value : x)))}
            className="min-h-11 rounded-card border border-border bg-surface px-3 text-sm outline-none focus:border-brand"
          />
        ))}
      </fieldset>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="min-h-11 rounded-card bg-brand px-4 text-sm font-semibold text-bg disabled:opacity-60">
          {pending ? "Guardando…" : "Guardar revisión"}
        </button>
        {saved ? <span role="status" className="text-sm text-brand">Guardado.</span> : null}
      </div>
    </form>
  );
}
