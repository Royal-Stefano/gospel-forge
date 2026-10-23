import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const ReviewSchema = z.object({
  applicationId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    let adminUserId = "usr-admin";
    let adminName = "Administrator";

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

      if (!profile || !["admin", "super_admin"].includes(profile.role)) {
        return NextResponse.json(
          { error: "Forbidden: Administrator role required to review artist applications." },
          { status: 403 }
        );
      }

      adminName = profile.display_name;
    }

    const body = await request.json();
    const validation = ReviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid review parameters.", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { applicationId, action, rejectionReason } = validation.data;
    const adminSupabase = getSupabaseAdminClient() || supabase;

    if (adminSupabase) {
      // Fetch application
      const { data: app, error: appError } = await adminSupabase
        .from("artist_applications")
        .select("id, user_id, ministry_or_band_name, status")
        .eq("id", applicationId)
        .single();

      if (appError || !app) {
        return NextResponse.json(
          { error: "Artist application not found." },
          { status: 404 }
        );
      }

      const newStatus = action === "approve" ? "approved" : "rejected";

      // 1. Update application record
      await adminSupabase
        .from("artist_applications")
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminUserId,
          rejection_reason: action === "reject" ? rejectionReason : null,
        })
        .eq("id", applicationId);

      // 2. If approved, update user's profile to approved artist and grant editor role
      if (action === "approve") {
        await adminSupabase
          .from("profiles")
          .update({
            artist_status: "approved",
            role: "editor", // Grants Studio publishing author capabilities
            updated_at: new Date().toISOString(),
          })
          .eq("id", app.user_id);
      } else {
        await adminSupabase
          .from("profiles")
          .update({
            artist_status: "rejected",
            updated_at: new Date().toISOString(),
          })
          .eq("id", app.user_id);
      }

      // 3. Write immutable audit log
      await adminSupabase.from("audit_logs").insert({
        user_id: adminUserId,
        user_name: adminName,
        user_role: "admin",
        action: action === "approve" ? "APPROVE_ARTIST" : "REJECT_ARTIST",
        target_type: "artist",
        target_id: app.user_id,
        target_title: app.ministry_or_band_name,
        metadata: {
          applicationId,
          action,
          rejectionReason,
        },
      });
    }

    return NextResponse.json({
      success: true,
      applicationId,
      action,
      message: `Artist application ${action}d successfully.`,
    });
  } catch (error) {
    console.error("Artist review error:", error);
    return NextResponse.json(
      { error: "Internal server error reviewing artist application." },
      { status: 500 }
    );
  }
}
