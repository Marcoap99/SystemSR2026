"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { minimumViableDayAction, toggleDsTaskAction } from "@/lib/actions/ds";
import { LANE_TARGET_H, dayResults, parseCommand, type DsTask, type Lane } from "@/lib/domain/ds";

type State = "En espera" | "Escuchando" | "Procesando" | "Respondiendo";

// Web Speech API: solo Chrome y similares; sin soporte la barra sigue por texto.
type Recognition = {
  lang: string;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
};

export function CommandBar({ tasks, hours }: { tasks: DsTask[]; hours: Record<Lane, number> }) {
  const router = useRouter();
  const [state, setState] = useState<State>("En espera");
  const [reply, setReply] = useState("Escribe o pulsa el micrófono.");
  const [text, setText] = useState("");
  const [, start] = useTransition();
  const rec = useRef<Recognition | null>(null);

  function run(input: string) {
    setState("Procesando");
    const cmd = parseCommand(input);
    const rows = dayResults(tasks);
    const say = (m: string) => {
      setReply(m);
      setState("Respondiendo");
      window.setTimeout(() => setState("En espera"), 1500);
    };
    switch (cmd.kind) {
      case "today":
        say(rows.length ? rows.map((r) => `${r.n} ${r.task.title}`).join(" · ") : "No hay resultados definidos para hoy.");
        break;
      case "mark": {
        const row = rows[cmd.n - 1];
        if (!row) return say(`No hay resultado ${cmd.n}.`);
        start(async () => {
          await toggleDsTaskAction(row.task.id, row.task.status !== "done");
          say(`Listo: ${row.n} ${row.task.status === "done" ? "reabierto" : "marcado"}.`);
        });
        break;
      }
      case "minimum":
        start(async () => {
          await minimumViableDayAction();
          say("Día mínimo viable registrado. Hoy cuenta.");
        });
        break;
      case "hours":
        say((["A", "B", "C"] as Lane[]).map((l) => `${l}: ${hours[l]}/${LANE_TARGET_H[l]} h`).join(" · "));
        break;
      case "open":
        say("Abriendo…");
        router.push(cmd.target === "nucleo" ? "/nucleo" : `/${cmd.target}`);
        break;
      default:
        say("No entendí. Prueba: qué tengo hoy, marca el 01, abre Aprender.");
    }
  }

  function listen() {
    const W = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!Ctor) {
      setReply("Tu navegador no soporta voz. Usa texto.");
      return;
    }
    const r = new Ctor();
    r.lang = "es-PE";
    r.onresult = (e) => run(e.results[0]?.[0]?.transcript ?? "");
    r.onend = () => setState((s) => (s === "Escuchando" ? "En espera" : s));
    r.onerror = () => {
      setState("En espera");
      setReply("No pude escuchar. Intenta de nuevo.");
    };
    rec.current = r;
    setState("Escuchando");
    r.start();
  }

  return (
    <div className="flex flex-col gap-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) run(text);
          setText("");
        }}
        className="flex gap-2"
      >
        <label htmlFor="ds-cmd" className="sr-only">Comando</label>
        <input id="ds-cmd" value={text} onChange={(e) => setText(e.target.value)} placeholder="qué tengo hoy · marca el 01 · abre Aprender" className="min-h-11 min-w-0 flex-1 rounded-card border border-border bg-surface px-3 font-mono text-sm outline-none focus:border-brand" />
        <button type="button" onClick={listen} aria-label="Hablar" className="min-h-11 min-w-11 rounded-card border border-border bg-surface-2 text-sm hover:border-brand">🎙</button>
        <button type="submit" className="min-h-11 rounded-card bg-brand px-4 text-sm font-semibold text-bg">Enviar</button>
      </form>
      <p className="font-mono text-xs text-text-muted" aria-live="polite">
        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-brand motion-safe:animate-pulse" />
        {state.toUpperCase()} · {reply}
      </p>
    </div>
  );
}
