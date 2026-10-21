"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { addCalendarEventAction } from "@/lib/actions/calendar";
import type { Lane } from "@/lib/domain/ds";

/** Realineación 21/10 — crea un evento real en Google Calendar desde la app. */
export function AddEventForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await addCalendarEventAction({
          lane: (data.get("lane") as Lane | "") ?? "",
          title: String(data.get("title") ?? ""),
          date: String(data.get("date") ?? ""),
          startTime: String(data.get("startTime") ?? ""),
          endTime: String(data.get("endTime") ?? ""),
        });
        formRef.current?.reset();
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo crear el evento");
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-card border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-2"
      >
        + Nuevo evento
      </button>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2 rounded-card border border-border bg-surface p-3">
      <select name="lane" defaultValue="" className="min-h-11 rounded-card border border-border bg-bg px-2 text-sm text-text">
        <option value="">Sin carril</option>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
      </select>
      <input name="title" placeholder="Título" required className="min-w-[160px] flex-1 rounded-card border border-border bg-bg px-2 py-1.5 text-sm text-text" />
      <input name="date" type="date" required className="rounded-card border border-border bg-bg px-2 py-1.5 text-sm text-text" />
      <input name="startTime" type="time" required className="rounded-card border border-border bg-bg px-2 py-1.5 text-sm text-text" />
      <input name="endTime" type="time" required className="rounded-card border border-border bg-bg px-2 py-1.5 text-sm text-text" />
      <button type="submit" disabled={pending} className="min-h-11 rounded-card bg-brand px-4 text-sm font-semibold text-bg disabled:opacity-50">
        Crear
      </button>
      <button type="button" onClick={() => setOpen(false)} className="rounded-card border border-border px-3 py-1.5 text-sm text-text-muted">
        Cancelar
      </button>
      {error ? <p role="alert" className="w-full text-sm text-warn">{error}</p> : null}
    </form>
  );
}
