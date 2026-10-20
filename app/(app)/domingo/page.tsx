import { getWeekData } from "@/lib/data/ds-week";
import { LANE_TARGET_H, type Lane } from "@/lib/domain/ds";
import { ReviewForm } from "@/components/nucleo/ReviewForm";

export const dynamic = "force-dynamic";

export default async function DomingoPage() {
  const d = await getWeekData();
  const lanes: Lane[] = ["A", "B", "C", "D"];
  const stats = [
    ...lanes.map((l) => ({ label: `Horas ${l}`, value: `${d.hours[l]}/${LANE_TARGET_H[l]}` })),
    { label: "Inglés", value: `${d.englishDays}/5 días` },
    { label: "SQL", value: `${d.sqlDays}/3 días` },
    { label: "Ruta B", value: `${d.routeB}/5` },
  ];
  return (
    <div className="flex flex-col gap-4">
      <header>
        <p className="hud-label">Domingo 19:00 · semana del {d.monday}</p>
        <h1 className="text-2xl font-semibold text-text">Revisión semanal</h1>
      </header>
      <section aria-label="Números de la semana" className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
        {stats.map((s) => (
          <div key={s.label} className="hud-panel p-3">
            <p className="font-mono text-xs text-text-muted">{s.label}</p>
            <p className="text-lg font-semibold text-text">{s.value}</p>
          </div>
        ))}
      </section>
      {d.week ? (
        <ReviewForm week={d.week.number} initial={d.review} />
      ) : (
        <p className="text-sm text-text-muted">La revisión se activa cuando empieza la temporada (19/10).</p>
      )}
    </div>
  );
}
