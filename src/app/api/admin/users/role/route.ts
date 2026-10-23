import { NextRequest, NextResponse } from "next/server";
import { verifyServerAuth } from "@/lib/auth/serverAuth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";
import { z } from "zod";

const RoleUpdateSchema = z.object({
  targetUserId: z.string().min(1),
  newRole: z.enum(["listener", "editor", "admin", "super_admin"]),
});

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`role_update:${clientIp}`, 30, 600);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many role update requests. Please try again later." },
        { status: 429 }
      );
    }

    // Strictly enforce Super Admin role
    const auth = await verifyServerAuth(request, ["super_admin"]);
    if (!auth.authenticated || !auth.user || !auth.profile) {
      return NextResponse.json(
        { error: auth.error || "Forbidden: Super Administrator privileges required." },
        { status: auth.statusCode || 403 }
      );
    }

    const body = await request.json();
    const validation = RoleUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid role payload.", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { targetUserId, newRole } = validation.data;
    const adminSupabase: any = getSupabaseAdminClient();

    if (adminSupabase) {
      const { error: updateError } = await adminSupabase
        .from("profiles")
        .update({
          role: newRole,
          updated_at: new Date().toISOString(),
        })
        .eq("id", targetUserId);

      if (updateError) {
        return NextResponse.json(
          { error: "Failed to update user profile in database.", details: updateError.message },
          { status: 500 }
        );
      }

      await adminSupabase.from("audit_logs").insert({
        user_id: auth.user.id,
        user_name: auth.profile.display_name,
        user_role: "super_admin",
        action: "UPDATE_USER_ROLE",
        target_type: "user",
        target_id: targetUserId,
        metadata: { newRole },
      });
    }

    return NextResponse.json({
      success: true,
      targetUserId,
      newRole,
      message: `User role successfully updated to '${newRole}'.`,
    });
  } catch (error) {
    console.error("Role update error:", error);
    return NextResponse.json(
      { error: "Internal server error updating user role." },
      { status: 500 }
    );
  }
}
