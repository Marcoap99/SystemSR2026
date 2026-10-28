"use client";

import { useState, useTransition } from "react";
import { setDsConnectionLevelAction, setDsConnectionStageAction, type DsConnectionLevel, type DsConnectionStage } from "@/lib/actions/ds";

export interface TechWeekContact {
  id: string;
  nivel: DsConnectionLevel | null;
  empresa: string | null;
  persona: string;
  nota: string | null;
  proxima_accion: string | null;
  etapa: DsConnectionStage;
  ultimo_contacto: string | null;
}

const LEVELS: DsConnectionLevel[] = ["A", "B", "C"];
// Vocabulario pedido para esta vista (pendiente/escrito/respondió/reunión
// agendada/sin respuesta) mapeado al etapa de ds_connections que ya usan
// /red y los seguimientos de Carril A -- no se duplica el campo.
const STAGE_LABEL: Record<DsConnectionStage, string> = {
  nuevo: "Pendiente",
  contactado: "Escrito",
  conversando: "Respondió",
  reunion: "Reunión agendada",
  sin_respuesta: "Sin respuesta",
  cerrado: "Cerrado",
};
const STAGE_OPTIONS: DsConnectionStage[] = ["nuevo", "contactado", "conversando", "reunion", "sin_respuesta"];

function Row({ contact }: { contact: TechWeekContact }) {
  const [nivel, setNivel] = useState(contact.nivel);
  const [etapa, setEtapa] = useState(contact.etapa);
  const [, startTransition] = useTransition();

  return (
    <tr className="border-b border-border align-top last:border-0">
      <td className="py-2 pr-3">
        <select
          value={nivel ?? ""}
          onChange={(e) => {
            const v = (e.target.value || null) as DsConnectionLevel | null;
            setNivel(v);
            startTransition(() => setDsConnectionLevelAction(contact.id, v));
          }}
          className="rounded-card border border-border bg-surface px-1.5 py-1 font-mono text-xs text-text"
        >
          <option value="">—</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </td>
      <td className="py-2 pr-3 text-text">{contact.empresa ?? "—"}</td>
      <td className="py-2 pr-3 text-text-muted">{contact.persona}</td>
      <td className="py-2 pr-3 text-text-muted">{contact.nota ?? "—"}</td>
      <td className="py-2 pr-3 text-text-muted">{contact.proxima_accion ?? "—"}</td>
      <td className="py-2 pr-3">
        <select
          value={etapa}
          onChange={(e) => {
            const v = e.target.value as DsConnectionStage;
            setEtapa(v);
            startTransition(() => setDsConnectionStageAction(contact.id, v));
          }}
          className="rounded-card border border-border bg-surface px-1.5 py-1 text-xs text-text"
        >
          {STAGE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STAGE_LABEL[s]}
            </option>
          ))}
          {!STAGE_OPTIONS.includes(etapa) ? <option value={etapa}>{STAGE_LABEL[etapa]}</option> : null}
        </select>
      </td>
      <td className="py-2 font-mono whitespace-nowrap text-text-muted">{contact.ultimo_contacto ?? "—"}</td>
    </tr>
  );
}

/** 27/10 — Contactos Perú Tech Week: tabla con nivel y estado editables. */
export function TechWeekTable({ contacts }: { contacts: TechWeekContact[] }) {
  if (contacts.length === 0) {
    return <p className="text-sm text-text-muted">Sin contactos todavía.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-text-muted">
            <th className="py-2 pr-3 font-medium">Nivel</th>
            <th className="py-2 pr-3 font-medium">Organización</th>
            <th className="py-2 pr-3 font-medium">Contacto</th>
            <th className="py-2 pr-3 font-medium">Qué es</th>
            <th className="py-2 pr-3 font-medium">Próximo paso</th>
            <th className="py-2 pr-3 font-medium">Estado</th>
            <th className="py-2 font-medium">Último contacto</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((c) => (
            <Row key={c.id} contact={c} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
