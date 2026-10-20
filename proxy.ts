import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Corre en todo excepto archivos estáticos y de imagen de Next.
     * `preview.html` es una maqueta estática temporal (datos de ejemplo); retirar tras aprobar V1.
     */
    "/((?!_next/static|_next/image|favicon.ico|preview\\.html$|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
