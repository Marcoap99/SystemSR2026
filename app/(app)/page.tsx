import { redirect } from "next/navigation";

/**
 * V2 brief, sección 6: Núcleo es la nueva portada ("el que yo abro del día
 * inicio del día"). El panel viejo de System SR sigue intacto en /archivo
 * (datos de Temporada 1, se conservan, no se borran) pero ya no es la raíz
 * ni aparece en la navegación.
 */
export default function RootPage() {
  redirect("/nucleo");
}
