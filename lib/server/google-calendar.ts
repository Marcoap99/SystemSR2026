/**
 * Realineación 21/10 — conexión real con Google Calendar (lectura +
 * escritura), pedida por Marco para Semana. Reemplaza el ICAL_URL
 * (solo lectura) del bloque 5: acá se guarda un access/refresh token
 * por usuario en user_settings (mismo criterio que Duolingo -- una
 * preferencia/integración de usuario, no una tabla ds_* aparte).
 *
 * OAuth propio (no el de Supabase Auth): el login de Marco sigue siendo
 * por contraseña -- esto es una conexión independiente, para que no
 * dependa de que Google Sign-In ya esté configurado.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";
import type { Lane } from "@/lib/domain/ds";

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const EVENTS_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
const SCOPE = "https://www.googleapis.com/auth/calendar.events";
// Token vencido o a punto: renovar con 2 minutos de margen.
const EXPIRY_MARGIN_MS = 2 * 60_000;

export interface CalendarEvent {
  id: string;
  title: string;
  lane: Lane | null;
  startISO: string;
  endISO: string;
}

const LANE_PREFIXES: { prefix: string; lane: Lane }[] = [
  { prefix: "A |", lane: "A" },
  { prefix: "B |", lane: "B" },
  { prefix: "C |", lane: "C" },
  { prefix: "D |", lane: "D" },
];

function splitLane(summary: string): { lane: Lane | null; title: string } {
  for (const { prefix, lane } of LANE_PREFIXES) {
    if (summary.startsWith(prefix)) return { lane, title: summary.slice(prefix.length).trim() };
  }
  return { lane: null, title: summary };
}

export function laneTitle(lane: Lane | "", title: string): string {
  return lane ? `${lane} | ${title}` : title;
}

export function buildAuthUrl(redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CALENDAR_CLIENT_ID ?? "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
  });
  return `${AUTH_URL}?${params.toString()}`;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<TokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CALENDAR_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET ?? "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Google rechazó la conexión (${res.status})`);
  return res.json() as Promise<TokenResponse>;
}

async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CALENDAR_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET ?? "",
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`No se pudo renovar el acceso a Google Calendar (${res.status})`);
  return res.json() as Promise<{ access_token: string; expires_in: number }>;
}

/** Token válido para el usuario autenticado, renovándolo si está vencido. null si no conectó Calendar. */
export async function getValidAccessToken(supabase: SupabaseClient<Database>): Promise<string | null> {
  const { data: settings } = await supabase.from("user_settings").select("*").maybeSingle();
  if (!settings?.google_calendar_refresh_token) return null;

  const expiresAt = settings.google_calendar_token_expires_at
    ? new Date(settings.google_calendar_token_expires_at).getTime()
    : 0;
  if (settings.google_calendar_access_token && expiresAt - EXPIRY_MARGIN_MS > Date.now()) {
    return settings.google_calendar_access_token;
  }

  const refreshed = await refreshAccessToken(settings.google_calendar_refresh_token);
  await supabase
    .from("user_settings")
    .update({
      google_calendar_access_token: refreshed.access_token,
      google_calendar_token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
    })
    .eq("user_id", settings.user_id);
  return refreshed.access_token;
}

export async function listEvents(accessToken: string, timeMinISO: string, timeMaxISO: string): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    timeMin: timeMinISO,
    timeMax: timeMaxISO,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250",
  });
  const res = await fetch(`${EVENTS_URL}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`No se pudo leer el calendario (${res.status})`);
  const data = (await res.json()) as {
    items?: { id: string; summary?: string; start?: { dateTime?: string; date?: string }; end?: { dateTime?: string; date?: string } }[];
  };
  return (data.items ?? [])
    .filter((e) => e.start?.dateTime && e.end?.dateTime)
    .map((e) => {
      const { lane, title } = splitLane(e.summary ?? "(sin título)");
      return { id: e.id, title, lane, startISO: e.start!.dateTime!, endISO: e.end!.dateTime! };
    });
}

/** `startDateTime`/`endDateTime`: wall-clock local sin offset (ej. "2026-10-21T16:45:00") -- se manda con timeZone aparte, como pide la API de Calendar. */
export async function createEvent(
  accessToken: string,
  { lane, title, startDateTime, endDateTime }: { lane: Lane | ""; title: string; startDateTime: string; endDateTime: string },
): Promise<void> {
  const res = await fetch(EVENTS_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: laneTitle(lane, title),
      start: { dateTime: startDateTime, timeZone: "America/Lima" },
      end: { dateTime: endDateTime, timeZone: "America/Lima" },
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`No se pudo crear el evento (${res.status})`);
}
