"use client";

import { useState, useTransition } from "react";
import {
  setDsConnectionStageAction,
  updateDsConnectionAction,
  type DsConnectionStage,
} from "@/lib/actions/ds";

export interface DsConnection {
  id: string;
  persona: string;
  empresa: string | null;
  rol: string | null;
  canal: string | null;
  etapa: DsConnectionStage;
  ultimo_contacto: string | null;
  proxima_accion: string | null;
  nota: string | null;
}

const STAGES: DsConnectionStage[] = ["nuevo", "contactado", "conversando", "reunion", "cerrado"];

/** Bloque 5 realineación — tarjeta de Red, con avance de etapa y edición simple. */
export function ConnectionCard({ connection }: { connection: DsConnection }) {
  const [editing, setEditing] = useState(false);
  const [ultimoContacto, setUltimoContacto] = useState(connection.ultimo_contacto ?? "");
  const [proximaAccion, setProximaAccion] = useState(connection.proxima_accion ?? "");
  const [nota, setNota] = useState(connection.nota ?? "");
  const [pending, startTransition] = useTransition();

  const idx = STAGES.indexOf(connection.etapa);
  const next = STAGES[idx + 1];

  function save() {
    startTransition(async () => {
      await updateDsConnectionAction(connection.id, {
        ultimo_contacto: ultimoContacto || null,
        proxima_accion: proximaAccion,
        nota,
      });
      setEditing(false);
    });
  }

  return (
    <div className="flex flex-col gap-2 rounded-card border border-border bg-bg p-3">
      <div>
        <p className="text-sm font-medium text-text">{connection.persona}</p>
        <p className="font-mono text-xs text-text-muted">
          {[connection.empresa, connection.rol, connection.canal].filter(Boolean).join(" · ")}
        </p>
      </div>

      {!editing ? (
        <>
          {connection.proxima_accion ? (
            <p className="text-xs text-text-muted">→ {connection.proxima_accion}</p>
          ) : null}
          {connection.ultimo_contacto ? (
            <p className="font-mono text-xs text-text-muted">Último contacto: {connection.ultimo_contacto}</p>
          ) : null}
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-card border border-border px-2 py-1 text-xs text-text-muted hover:border-brand"
            >
              Editar
            </button>
            {next ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => startTransition(() => setDsConnectionStageAction(connection.id, next))}
                className="rounded-card border border-border px-2 py-1 text-xs text-dim-conectar hover:border-dim-conectar disabled:opacity-60"
              >
                Pasar a {next} →
              </button>
            ) : null}
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1 text-xs text-text-muted">
            Último contacto
            <input
              type="date"
              value={ultimoContacto}
              onChange={(e) => setUltimoContacto(e.target.value)}
              className="rounded-card border border-border px-2 py-1 text-sm text-text"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-text-muted">
            Próxima acción
            <input
              value={proximaAccion}
              onChange={(e) => setProximaAccion(e.target.value)}
              className="rounded-card border border-border px-2 py-1 text-sm text-text"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-text-muted">
            Nota
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={2}
              className="rounded-card border border-border px-2 py-1 text-sm text-text"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={save}
              className="rounded-card bg-brand px-3 py-1 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-card border border-border px-3 py-1 text-xs text-text-muted"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
