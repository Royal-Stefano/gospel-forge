import { NextRequest, NextResponse } from "next/server";
import { verifyServerAuth } from "@/lib/auth/serverAuth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateStatusTransition } from "@/lib/publishing/workflow";
import { PublicationStatus, UserRole } from "@/types";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";
import { z } from "zod";

const TransitionSchema = z.object({
  episodeId: z.string().min(1),
  toStatus: z.enum([
    "draft",
    "submitted",
    "in_review",
    "approved",
    "published",
    "rejected",
    "archived",
    "scheduled",
  ]),
  rejectionReason: z.string().optional(),
  scheduledDate: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`publish_action:${clientIp}`, 30, 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many publishing status requests. Please slow down." },
        { status: 429 }
      );
    }

    // Require verified user authentication
    const auth = await verifyServerAuth(request);
    if (!auth.authenticated || !auth.user || !auth.profile) {
      return NextResponse.json(
        { error: auth.error || "Authentication required." },
        { status: auth.statusCode || 401 }
      );
    }

    const body = await request.json();
    const validation = TransitionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid transition parameters.", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { episodeId, toStatus, rejectionReason, scheduledDate } =
      validation.data;

    const supabase = await createSupabaseServerClient();
    let currentStatus: PublicationStatus = "draft";
    let isAuthor = false;
    let episodeTitle = "Episode";

    // Fetch existing episode from database
    if (supabase) {
      const { data: episode, error: epError } = await supabase
        .from("episodes")
        .select("id, title, status, author_id")
        .eq("id", episodeId)
        .single();

      if (epError || !episode) {
        return NextResponse.json(
          { error: "Episode not found." },
          { status: 404 }
        );
      }

      currentStatus = episode.status as PublicationStatus;
      isAuthor = episode.author_id === auth.user.id;
      episodeTitle = episode.title;
    } else {
      isAuthor = true; // In local development test harness
    }

    // Validate state machine rules
    const transitionCheck = validateStatusTransition({
      episodeId,
      fromStatus: currentStatus,
      toStatus: toStatus as PublicationStatus,
      userId: auth.user.id,
      userRole: auth.profile.role,
      isAuthor,
      rejectionReason,
    });

    if (!transitionCheck.allowed) {
      return NextResponse.json(
        { error: transitionCheck.error || "State transition forbidden by publishing rules." },
        { status: 403 }
      );
    }

    const adminSupabase: any = getSupabaseAdminClient() || supabase;
    const nowIso = new Date().toISOString();

    if (adminSupabase) {
      const updatePayload: Record<string, any> = {
        status: toStatus,
        updated_at: nowIso,
      };

      if (toStatus === "published") {
        updatePayload.published_at = nowIso;
      } else if (toStatus === "scheduled" && scheduledDate) {
        updatePayload.scheduled_publish_at = new Date(scheduledDate).toISOString();
      } else if (toStatus === "rejected") {
        updatePayload.rejection_reason = rejectionReason || null;
      }

      const { error: updateError } = await adminSupabase
        .from("episodes")
        .update(updatePayload)
        .eq("id", episodeId);

      if (updateError) {
        return NextResponse.json(
          { error: "Database error updating episode status.", details: updateError.message },
          { status: 500 }
        );
      }

      // Record immutable audit entry
      await adminSupabase.from("audit_logs").insert({
        user_id: auth.user.id,
        user_name: auth.profile.display_name,
        user_role: auth.profile.role,
        action: transitionCheck.auditAction || `SET_STATUS_${toStatus.toUpperCase()}`,
        target_type: "episode",
        target_id: episodeId,
        target_title: episodeTitle,
        metadata: {
          fromStatus: currentStatus,
          toStatus,
          rejectionReason,
          scheduledDate,
        },
      });
    }

    return NextResponse.json({
      success: true,
      episodeId,
      fromStatus: currentStatus,
      toStatus,
      message: `Episode status successfully updated to '${toStatus}'.`,
    });
  } catch (error) {
    console.error("Episode status transition error:", error);
    return NextResponse.json(
      { error: "Internal server error during episode publishing transition." },
      { status: 500 }
    );
  }
}
