import type { NucleoData } from "@/lib/data/ds-nucleo";

function fmtH(n: number): string {
  return (Math.round(n * 10) / 10).toString();
}

/** Bloque 4 realineación — franja de 5 contadores, arriba de los paneles de Núcleo. */
export function CounterStrip({ data }: { data: NucleoData }) {
  const counters: { label: string; value: string }[] = [
    { label: "Horas semana", value: `${fmtH(data.hoursWeekTotal)}/${fmtH(data.hoursWeekTarget)} h` },
    { label: "Racha inglés", value: `${data.englishStreak} d` },
    { label: "Racha Duolingo", value: data.duolingo ? `${data.duolingo.current} d` : "—" },
    { label: "Días al hito", value: data.milestoneDays !== null ? `${data.milestoneDays}` : "—" },
    { label: "Ruta B", value: `${data.routeB}/5` },
  ];

  return (
    <div className="hud-panel grid grid-cols-2 gap-3 p-4 sm:grid-cols-5">
      {counters.map((c) => (
        <div key={c.label} className="flex flex-col gap-0.5">
          <p className="hud-label">{c.label}</p>
          <p className="font-mono text-lg font-semibold tabular-nums text-text">{c.value}</p>
        </div>
      ))}
    </div>
  );
}
