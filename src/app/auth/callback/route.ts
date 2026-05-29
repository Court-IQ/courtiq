import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

/**
 * Handle email confirmation links.
 * Supabase sends users here after they click the email confirmation link.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // On any failure, send back to login
  return NextResponse.redirect(`${origin}/login?error=callback_failed`);
}
