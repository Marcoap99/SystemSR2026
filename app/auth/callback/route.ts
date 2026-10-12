import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAllowedEmail } from "@/lib/auth/allowed";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && isAllowedEmail(data.user?.email)) {
      return NextResponse.redirect(`${origin}/`);
    }
    // Correo no autorizado: no dejar sesión viva.
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=denied`);
  }

  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
