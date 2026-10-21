"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createEvent, getValidAccessToken } from "@/lib/server/google-calendar";
import type { Lane } from "@/lib/domain/ds";

/** Realineación 21/10 — crear un evento en Google Calendar desde Semana (escritura real, no solo lectura). */
export async function addCalendarEventAction(input: {
  lane: Lane | "";
  title: string;
  date: string;
  startTime: string;
  endTime: string;
}) {
  const title = input.title.trim().slice(0, 140);
  if (!title) throw new Error("Falta el título");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error("Fecha inválida");
  if (!/^\d{2}:\d{2}$/.test(input.startTime) || !/^\d{2}:\d{2}$/.test(input.endTime)) throw new Error("Hora inválida");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const accessToken = await getValidAccessToken(supabase);
  if (!accessToken) throw new Error("Conectá Google Calendar primero");

  await createEvent(accessToken, {
    lane: input.lane,
    title,
    startDateTime: `${input.date}T${input.startTime}:00`,
    endDateTime: `${input.date}T${input.endTime}:00`,
  });
  revalidatePath("/semana");
}
