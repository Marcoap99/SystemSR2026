/**
 * Única fuente de verdad de fechas para toda la app.
 *
 * Todas las fechas de negocio (racha, semana actual, contador regresivo)
 * se calculan en America/Lima (UTC-5, sin horario de verano), NUNCA con
 * `new Date()` disperso en componentes — eso es lo que rompería la racha
 * sola si el servidor corre en UTC y el usuario marca de noche.
 *
 * `today()` es la única función que lee el reloj real. Todo lo demás en
 * lib/domain recibe la fecha de "hoy" como parámetro (string 'YYYY-MM-DD'),
 * lo que las mantiene puras y testeables sin mockear el reloj del sistema.
 */

export const APP_TIMEZONE = "America/Lima";

/** Fecha de calendario de "hoy" en America/Lima, como 'YYYY-MM-DD'. */
export function today(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * Parsea 'YYYY-MM-DD' como medianoche UTC. Una vez que una fecha calendario
 * ya salió de today() (o vino de la base de datos, que solo guarda `date`
 * sin hora), es segura de diferenciar en UTC sin volver a tocar zonas
 * horarias — son dos fechas de calendario, no dos instantes.
 */
function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d));
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Días de `fromISO` a `toISO` (positivo si `toISO` es posterior). */
export function diffDays(fromISO: string, toISO: string): number {
  const ms = parseISODate(toISO).getTime() - parseISODate(fromISO).getTime();
  return Math.round(ms / 86_400_000);
}

export function addDays(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toISODate(d);
}

/** true si `iso` cae en viernes (día de cierre de semana, C.2). */
export function isFriday(iso: string): boolean {
  return parseISODate(iso).getUTCDay() === 5;
}

/** Lunes de la semana ISO que contiene `iso`. */
export function mondayOf(iso: string): string {
  const d = parseISODate(iso);
  const day = d.getUTCDay(); // 0=domingo .. 6=sábado
  const offset = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + offset);
  return toISODate(d);
}

/** Semanas completas entre los lunes de `fromISO` y `toISO`. */
export function diffWeeks(fromISO: string, toISO: string): number {
  return diffDays(mondayOf(fromISO), mondayOf(toISO)) / 7;
}

/** Trimestre calendario de una fecha, formato 'YYYY-QN'. */
export function quarterOf(iso: string): string {
  const [y, m] = iso.split("-").map(Number) as [number, number, number];
  const q = Math.floor((m - 1) / 3) + 1;
  return `${y}-Q${q}`;
}

const MESES_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

const MESES_ES_ABBR = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
] as const;

/** Nombre de mes en español, minúscula: "agosto". */
export function monthNameEs(iso: string): string {
  const month = Number(iso.slice(5, 7));
  return MESES_ES[month - 1]!;
}

/** "Agosto 2026" — para agrupar el expediente por mes (7.6). */
export function monthYearLabelEs(iso: string): string {
  const name = monthNameEs(iso);
  const year = iso.slice(0, 4);
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`;
}

/** "10 nov" — usado en el tooltip de fase bloqueada (6.6) y fechas cortas de UI. */
export function formatShortEs(iso: string): string {
  const [, m, d] = iso.split("-") as [string, string, string];
  const month = Number(m);
  return `${Number(d)} ${MESES_ES_ABBR[month - 1]}`;
}

/** "10/11/2026" */
export function formatDMY(iso: string): string {
  const [y, m, d] = iso.split("-") as [string, string, string];
  return `${d}/${m}/${y}`;
}
