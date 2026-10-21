import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeCodeForTokens } from "@/lib/server/google-calendar";

/** Realineación 21/10 — vuelta de Google con el code; guarda los tokens en user_settings. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (searchParams.get("error") || !code) {
    return NextResponse.redirect(`${origin}/semana?calendar=error`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/login`);

  try {
    const tokens = await exchangeCodeForTokens(code, `${origin}/api/calendar/callback`);
    if (!tokens.refresh_token) return NextResponse.redirect(`${origin}/semana?calendar=error`);

    const { error } = await supabase.from("user_settings").upsert(
      {
        user_id: user.id,
        google_calendar_access_token: tokens.access_token,
        google_calendar_refresh_token: tokens.refresh_token,
        google_calendar_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        google_calendar_connected_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (error) return NextResponse.redirect(`${origin}/semana?calendar=error`);

    return NextResponse.redirect(`${origin}/semana?calendar=connected`);
  } catch {
    return NextResponse.redirect(`${origin}/semana?calendar=error`);
  }
}
