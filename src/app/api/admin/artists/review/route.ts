import { NextRequest, NextResponse } from "next/server";
import { verifyServerAuth } from "@/lib/auth/serverAuth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";
import { z } from "zod";

const ReviewSchema = z.object({
  applicationId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`artist_review:${clientIp}`, 60, 600);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many review requests. Please try again later." },
        { status: 429 }
      );
    }

    // Require Administrator or Super Administrator role
    const auth = await verifyServerAuth(request, ["admin", "super_admin"]);
    if (!auth.authenticated || !auth.user || !auth.profile) {
      return NextResponse.json(
        { error: auth.error || "Forbidden: Administrator role required to review artist applications." },
        { status: auth.statusCode || 403 }
      );
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
    const adminSupabase: any = getSupabaseAdminClient();

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
      const { error: updateAppError } = await adminSupabase
        .from("artist_applications")
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          reviewed_by: auth.user.id,
          rejection_reason: action === "reject" ? rejectionReason : null,
        })
        .eq("id", applicationId);

      if (updateAppError) {
        return NextResponse.json(
          { error: "Failed to update application status.", details: updateAppError.message },
          { status: 500 }
        );
      }

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

      // 3. Log audit action
      await adminSupabase.from("audit_logs").insert({
        user_id: auth.user.id,
        user_name: auth.profile.display_name,
        user_role: auth.profile.role,
        action: action === "approve" ? "APPROVE_ARTIST_APPLICATION" : "REJECT_ARTIST_APPLICATION",
        target_type: "artist_application",
        target_id: applicationId,
        target_title: app.ministry_or_band_name,
        metadata: {
          applicantUserId: app.user_id,
          rejectionReason: action === "reject" ? rejectionReason : null,
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
