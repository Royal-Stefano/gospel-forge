import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/";

  // Sanitize next parameter to prevent open redirect vulnerabilities
  if (
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.includes("\\") ||
    next.includes("://")
  ) {
    next = "/";
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return the user to an error or sign-in page if code exchange fails
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
