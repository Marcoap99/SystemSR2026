import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildAuthUrl } from "@/lib/server/google-calendar";

/** Realineación 21/10 — inicia la conexión OAuth con Google Calendar (independiente del login). */
export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/login`);

  return NextResponse.redirect(buildAuthUrl(`${origin}/api/calendar/callback`));
}
