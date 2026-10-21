"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { bumpMiamiHoursAction, setMiamiWeeklyCapAction } from "@/lib/actions/ds";

/** Carril B — "Apoyo deal Miami": sección aparte, horas propias y tope editable (hoy "por definir"). */
export function MiamiSection({ hoursLogged, weeklyCap }: { hoursLogged: number; weeklyCap: number | null }) {
  const [hours, setHours] = useState(hoursLogged);
  const [editingCap, setEditingCap] = useState(false);
  const [, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function bump(delta: number) {
    const prev = hours;
    setHours(Math.max(0, Math.round((prev + delta) * 10) / 10));
    start(async () => {
      try {
        setHours(await bumpMiamiHoursAction(delta));
      } catch {
        setHours(prev);
      }
    });
  }

  function handleCapSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = String(new FormData(e.currentTarget).get("cap") ?? "").trim();
    const value = raw === "" ? null : Number(raw);
    start(() => setMiamiWeeklyCapAction(Number.isFinite(value) ? value : null));
    setEditingCap(false);
  }

  return (
    <section className="hud-panel flex flex-col gap-2 p-4">
      <h2 className="hud-label">Apoyo deal Miami (insurtech)</h2>
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-sm text-text">
          {hours} h {editingCap ? null : <span className="text-text-muted">/ {weeklyCap ?? "por definir"} {weeklyCap !== null ? "h" : ""}</span>}
        </span>
        <button type="button" onClick={() => bump(-0.5)} className="min-h-11 min-w-11 rounded-card border border-border text-text-muted hover:border-brand active:scale-95">
          −
        </button>
        <button type="button" onClick={() => bump(0.5)} className="min-h-11 rounded-card border border-border px-3 font-mono text-xs text-text hover:border-brand active:scale-95">
          +0.5 h
        </button>
        {editingCap ? (
          <form ref={formRef} onSubmit={handleCapSubmit} className="flex items-center gap-2">
            <input
              name="cap"
              type="number"
              step="0.5"
              min="0"
              defaultValue={weeklyCap ?? ""}
              placeholder="por definir"
              className="min-h-11 w-24 rounded-card border border-border bg-surface px-2 text-sm text-text"
            />
            <button type="submit" className="min-h-11 rounded-card border border-border px-2 text-xs text-text hover:border-brand">
              Guardar
            </button>
          </form>
        ) : (
          <button type="button" onClick={() => setEditingCap(true)} className="text-xs text-brand hover:underline">
            Editar tope
          </button>
        )}
      </div>
    </section>
  );
}
