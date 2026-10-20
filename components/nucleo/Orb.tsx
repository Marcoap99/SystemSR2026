import { LANE_COLOR, LANE_TARGET_H, laneProgress, type Lane } from "@/lib/domain/ds";

const RINGS: { lane: Lane; r: number }[] = [
  { lane: "A", r: 130 },
  { lane: "B", r: 104 },
  { lane: "C", r: 78 },
];

/** Orbe de 3 anillos: horas de la semana por carril contra su meta. */
export function Orb({ hours, label }: { hours: Record<Lane, number>; label: string }) {
  const summary = RINGS.map(
    ({ lane }) => `Carril ${lane}: ${hours[lane]} de ${LANE_TARGET_H[lane]} horas`,
  ).join(". ");
  return (
    <svg viewBox="0 0 320 320" role="img" aria-label={`${label}. ${summary}`} className="mx-auto h-auto w-full max-w-[320px]">
      <circle cx="160" cy="160" r="150" fill="none" stroke="rgba(255,255,255,.12)" strokeDasharray="2 8" className="motion-safe:animate-[spin_80s_linear_infinite]" style={{ transformOrigin: "160px 160px" }} />
      {RINGS.map(({ lane, r }) => {
        const c = 2 * Math.PI * r;
        const p = laneProgress(lane, hours[lane]);
        return (
          <g key={lane} transform="rotate(-90 160 160)">
            <circle cx="160" cy="160" r={r} fill="none" stroke={LANE_COLOR[lane]} strokeOpacity=".18" strokeWidth="10" />
            <circle cx="160" cy="160" r={r} fill="none" stroke={LANE_COLOR[lane]} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${c * p} ${c}`} />
          </g>
        );
      })}
      <text x="160" y="152" textAnchor="middle" className="fill-text-muted font-mono" fontSize="12" letterSpacing="2">
        {label.toUpperCase()}
      </text>
      <text x="160" y="184" textAnchor="middle" className="fill-text font-mono" fontSize="30" fontWeight="600">
        {Math.round((hours.A + hours.B + hours.C) * 10) / 10} h
      </text>
    </svg>
  );
}
