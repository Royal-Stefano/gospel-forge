import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const RoleUpdateSchema = z.object({
  targetUserId: z.string().min(1),
  newRole: z.enum(["listener", "editor", "admin", "super_admin"]),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    let adminUserId = "usr-superadmin";
    let adminName = "Pastor Marcus Vance";

    if (supabase) {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json(
          { error: "Authentication required." },
          { status: 401 }
        );
      }

      adminUserId = user.id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, display_name")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "super_admin") {
        return NextResponse.json(
          { error: "Forbidden: Super Administrator privileges required to reassign user roles." },
          { status: 403 }
        );
      }

      adminName = profile.display_name;
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
    const adminSupabase = getSupabaseAdminClient() || supabase;

    if (adminSupabase) {
      await adminSupabase
        .from("profiles")
        .update({
          role: newRole,
          updated_at: new Date().toISOString(),
        })
        .eq("id", targetUserId);

      await adminSupabase.from("audit_logs").insert({
        user_id: adminUserId,
        user_name: adminName,
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
