import { Card } from "@/components/ui/Card";

const NODE_CLASS =
  "rounded-card border px-3 py-2 text-center text-sm font-semibold sm:px-4 sm:py-3";

const RULES = [
  { code: "R1", text: "Todo aprendizaje deja una prueba verificable." },
  { code: "R2", text: "Todo artefacto sirve a un resultado." },
  { code: "R3a", text: "Toda conexión interna desbloquea algo concreto." },
  { code: "R3b", text: "Toda exposición externa deja algo tuyo." },
] as const;

/** B.1.1 — la cadena de homologación: cómo se conectan las 5 dimensiones. */
export function HowItWorks() {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-text">Cómo funciona esto</h2>
      <p className="mt-1 text-sm text-text-muted">
        Nada de lo que hacés queda suelto — cada dimensión alimenta a la siguiente.
      </p>

      <div className="mt-5 flex flex-col items-center gap-2">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className={`${NODE_CLASS} border-dim-aprender/40 bg-dim-aprender/10 text-dim-aprender`}>
            APRENDER
          </span>
          <span className="text-text-muted" aria-hidden="true">
            ──►
          </span>
          <span className={`${NODE_CLASS} border-dim-generar/40 bg-dim-generar/10 text-dim-generar`}>
            GENERAR
          </span>
          <span className="text-text-muted" aria-hidden="true">
            ──►
          </span>
          <span className={`${NODE_CLASS} border-dim-lograr/40 bg-dim-lograr/10 text-dim-lograr`}>
            LOGRAR
          </span>
        </div>
        <div className="text-text-muted" aria-hidden="true">
          ▲
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className={`${NODE_CLASS} border-dim-exponer/40 bg-dim-exponer/10 text-dim-exponer`}>
            EXPONER
          </span>
          <span className="text-text-muted" aria-hidden="true">
            ──►
          </span>
          <span className={`${NODE_CLASS} border-dim-conectar/40 bg-dim-conectar/10 text-dim-conectar`}>
            CONECTAR
          </span>
        </div>
        <p className="text-xs text-text-muted">
          Exponer y Conectar alimentan de vuelta a Aprender y a Lograr — no son un callejón sin salida.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {RULES.map((rule) => (
          <div key={rule.code} className="flex items-start gap-2 rounded-card border border-border p-3">
            <span className="shrink-0 rounded-badge bg-bg px-1.5 py-0.5 font-mono text-xs font-semibold text-text-muted">
              {rule.code}
            </span>
            <p className="text-sm text-text">{rule.text}</p>
          </div>
        ))}
      </div>

      {/* V1.2 — nota de versión (patch sección 6). */}
      <p className="mt-4 border-t border-border pt-4 text-xs text-text-muted">
        <span className="font-mono">v1.2</span> — Repriorización: gamificación y behavior design pasan a
        prioridad 1 por pedido del área. AR11 (IA aplicada a research) se pospone a Q1 2027.
      </p>
    </Card>
  );
}
