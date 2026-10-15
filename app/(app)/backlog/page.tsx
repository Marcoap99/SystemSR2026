import { createClient } from "@/lib/supabase/server";
import { AprenderTabs } from "@/components/nucleo/AprenderTabs";

export const dynamic = "force-dynamic";

// Brief sección 9: Archivo = AR1, AR2, AR6, AR9, AR10 (se ven en la pestaña Archivo).
// Backlog de baja prioridad: AR3, AR4, AR5, AR8, AR7.x y AT1..AT5.
// AM1..AM3 apuntan a semanas viejas: pendiente de decidir si pasan al plan de inglés/SQL.
const BACKLOG = ["AR3", "AR4", "AR5", "AR8", "AR7.1", "AR7.2", "AR7.3", "AT1", "AT2", "AT3", "AT4", "AT5"];
const REVIEW = ["AM1", "AM2", "AM3"];

type Row = { code: string; title: string; priority: number };
type Counts = Map<string, { total: number; done: number }>;

function Section({ title, note, rows, counts }: { title: string; note: string; rows: Row[]; counts: Counts }) {
  return (
    <section className="rounded-card border border-border bg-surface p-4">
      <h2 className="font-semibold text-text">{title}</h2>
      <p className="text-sm text-text-muted">{note}</p>
      <ul className="mt-2 flex flex-col">
        {rows.map((r) => {
          const c = counts.get(r.code) ?? { total: 0, done: 0 };
          return (
            <li key={r.code} className="flex items-baseline justify-between gap-3 border-t border-border py-2 first:border-t-0">
              <span className="text-sm text-text">
                <span className="mr-2 font-mono text-xs text-text-muted">{r.code}</span>
                {r.title}
              </span>
              <span className="shrink-0 font-mono text-xs text-text-muted">
                {c.done}/{c.total}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default async function BacklogPage() {
  const supabase = await createClient();
  const [items, res] = await Promise.all([
    supabase.from("learn_items").select("code,title,priority").in("code", [...BACKLOG, ...REVIEW]),
    supabase.from("resources").select("learn_code,status").in("learn_code", [...BACKLOG, ...REVIEW]),
  ]);
  const counts: Counts = new Map();
  for (const r of res.data ?? []) {
    if (!r.learn_code) continue;
    const c = counts.get(r.learn_code) ?? { total: 0, done: 0 };
    c.total += 1;
    if (r.status === "done") c.done += 1;
    counts.set(r.learn_code, c);
  }
  const rows = ((items.data ?? []) as Row[]).sort(
    (a, b) => a.priority - b.priority || a.code.localeCompare(b.code, "es", { numeric: true }),
  );

  return (
    <div className="flex flex-col gap-4">
      <AprenderTabs active="/backlog" />
      <h1 className="text-2xl font-semibold text-text">Backlog de aprendizaje</h1>
      <Section title="Prioridad baja" note="Temporada 1: se consulta, no se estudia ahora." rows={rows.filter((r) => BACKLOG.includes(r.code))} counts={counts} />
      <Section title="Por decidir" note="Apuntan a semanas viejas. ¿Pasan al plan de inglés/SQL o quedan como archivo?" rows={rows.filter((r) => REVIEW.includes(r.code))} counts={counts} />
    </div>
  );
}
