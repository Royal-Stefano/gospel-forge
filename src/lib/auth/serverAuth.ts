import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { UserRole } from "@/types";

export interface ServerAuthResult {
  authenticated: boolean;
  user?: { id: string; email?: string };
  profile?: {
    id: string;
    role: UserRole;
    display_name: string;
    artist_status: string;
  };
  error?: string;
  statusCode?: number;
}

/**
 * Server-side authentication and role verification for API Route Handlers.
 * In production, strictly requires valid Supabase session cookies and database profile.
 * Prevents simulated mock identity assumption in production environments.
 */
export async function verifyServerAuth(
  request: NextRequest,
  allowedRoles?: UserRole[]
): Promise<ServerAuthResult> {
  const supabase = await createSupabaseServerClient();
  const isDevMockAllowed =
    process.env.NODE_ENV === "development" &&
    process.env.ALLOW_LOCAL_DEV_MOCK === "true";

  if (!supabase) {
    if (isDevMockAllowed) {
      // Strictly development-only simulated test harness
      return {
        authenticated: true,
        user: { id: "usr-admin", email: "admin@gospelforge.com" },
        profile: {
          id: "usr-admin",
          role: "admin",
          display_name: "Dev Administrator",
          artist_status: "approved",
        },
      };
    }

    return {
      authenticated: false,
      error: "Authentication service unavailable. Supabase environment unconfigured.",
      statusCode: 503,
    };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      authenticated: false,
      error: "Authentication required to access this resource.",
      statusCode: 401,
    };
  }

  // Fetch verified profile from database
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, display_name, artist_status")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      authenticated: false,
      error: "User profile not found or inactive.",
      statusCode: 403,
    };
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(profile.role as UserRole)) {
      return {
        authenticated: false,
        error: `Forbidden: Requires one of [${allowedRoles.join(
          ", "
        )}] role privilege.`,
        statusCode: 403,
      };
    }
  }

  return {
    authenticated: true,
    user: { id: user.id, email: user.email },
    profile: {
      id: profile.id,
      role: profile.role as UserRole,
      display_name: profile.display_name,
      artist_status: profile.artist_status,
    },
  };
}
