"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { capReached, countInMonth } from "@/lib/domain/exposures";

/**
 * 7.5 / 6.8: `output` es obligatorio (si no, el evento no cuenta — P9).
 * También se re-verifica el techo del mes en el servidor, no solo en el
 * botón deshabilitado del cliente.
 */
export async function addExposureEventAction(input: {
  exposureCode: string;
  date: string;
  name: string;
  output: string;
}) {
  if (!input.output.trim()) {
    throw new Error("La salida obligatoria no puede quedar vacía.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: exposure, error: exposureError } = await supabase
    .from("exposures")
    .select("*")
    .eq("code", input.exposureCode)
    .single();
  if (exposureError || !exposure) throw new Error("Tipo de exposición no encontrado.");

  if (exposure.cap_per_month != null) {
    const { data: events } = await supabase
      .from("exposure_events")
      .select("date, counts")
      .eq("exposure_code", input.exposureCode);

    const count = countInMonth(events ?? [], input.date);
    if (capReached(count, exposure.cap_per_month)) {
      throw new Error("Techo del mes alcanzado.");
    }
  }

  const { error } = await supabase.from("exposure_events").insert({
    exposure_code: input.exposureCode,
    date: input.date,
    name: input.name,
    output: input.output,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/exponer");
}
