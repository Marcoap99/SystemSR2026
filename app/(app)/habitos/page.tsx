import { createDsClient } from "@/lib/supabase/ds";
import { addDays, today } from "@/lib/domain/dates";
import { AprenderTabs } from "@/components/nucleo/AprenderTabs";
import { HabitToggle } from "@/components/nucleo/HabitToggle";

export const dynamic = "force-dynamic";

const DAY = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default async function HabitosPage() {
  const db = await createDsClient();
  const t = today();
  const from = addDays(t, -6);
  const { data } = await db.from("ds_habit_log").select("habit,day,minutes").gte("day", from).lte("day", t);
  const rows = (data ?? []) as { habit: string; day: string; minutes: number }[];
  const has = (h: string, d: string) => rows.some((r) => r.habit === h && r.day === d && r.minutes > 0);
  const days = Array.from({ length: 7 }, (_, i) => addDays(t, i - 6));
  const dow = new Date(`${t}T00:00:00Z`).getUTCDay();
  const sqlDay = dow === 2 || dow === 4 || dow === 5;

  return (
    <div className="flex flex-col gap-4">
      <AprenderTabs active="/habitos" />
      <header>
        <h1 className="text-2xl font-semibold text-text">Inglés y SQL</h1>
        <p className="text-sm text-text-muted">Inglés para entrevista 25 min a diario. SQL 30 min mar/jue/vie. Regla: nunca dos días en cero.</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        <HabitToggle habit="english" label="Inglés para entrevista" detail="25 min · hoy" on={has("english", t)} />
        <HabitToggle habit="sql" label={sqlDay ? "SQL: práctica corta" : "SQL (hoy no toca)"} detail="30 min · mar/jue/vie" on={has("sql", t)} />
      </div>
      <section aria-label="Últimos 7 días" className="hud-panel p-4">
        <h2 className="mb-3 hud-label">Últimos 7 días</h2>
        <div className="grid grid-cols-7 gap-2 text-center font-mono text-xs text-text-muted">
          {days.map((d) => {
            const dw = new Date(`${d}T00:00:00Z`).getUTCDay();
            return (
              <div key={d} aria-label={`${DAY[dw]} ${d}: inglés ${has("english", d) ? "sí" : "no"}, SQL ${has("sql", d) ? "sí" : "no"}`}>
                <div>{DAY[dw]}</div>
                <div className={`mt-1 h-6 rounded-md ${has("english", d) ? "bg-brand" : "bg-surface-2"}`} />
                <div className={`mt-1 h-3 rounded-md ${has("sql", d) ? "bg-dim-aprender" : "bg-surface-2"}`} />
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-text-muted">Barra superior: inglés · barra inferior: SQL.</p>
      </section>
    </div>
  );
}
