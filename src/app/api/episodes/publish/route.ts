import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { validateStatusTransition } from "@/lib/publishing/workflow";
import { PublicationStatus, UserRole } from "@/types";
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
    const supabase = await createSupabaseServerClient();
    let userId = "usr-admin";
    let userRole: UserRole = "admin";
    let userName = "Administrator";

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

      userId = user.id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, display_name")
        .eq("id", user.id)
        .single();

      if (profile) {
        userRole = profile.role;
        userName = profile.display_name;
      }
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

    let currentStatus: PublicationStatus = "draft";
    let isAuthor = false;
    let episodeTitle = "Episode";

    // Fetch existing episode from database if Supabase is active
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
      isAuthor = episode.author_id === userId;
      episodeTitle = episode.title;
    } else {
      isAuthor = true; // In local demo mode
    }

    // Validate state machine rules
    const transitionCheck = validateStatusTransition({
      episodeId,
      fromStatus: currentStatus,
      toStatus: toStatus as PublicationStatus,
      userId,
      userRole,
      isAuthor,
      rejectionReason,
    });

    if (!transitionCheck.allowed) {
      return NextResponse.json(
        { error: transitionCheck.error },
        { status: 403 }
      );
    }

    // Perform database status mutation
    const adminSupabase = getSupabaseAdminClient();
    const clientToUse = adminSupabase || supabase;

    if (clientToUse) {
      const updatePayload: Record<string, any> = {
        status: toStatus,
        updated_at: new Date().toISOString(),
      };

      if (toStatus === "published") {
        updatePayload.published_at = new Date().toISOString();
      } else if (toStatus === "scheduled" && scheduledDate) {
        updatePayload.scheduled_publish_at = new Date(scheduledDate).toISOString();
      } else if (toStatus === "rejected") {
        updatePayload.rejection_reason = rejectionReason || "Does not meet guidelines.";
      }

      await clientToUse
        .from("episodes")
        .update(updatePayload)
        .eq("id", episodeId);

      // Record immutable audit log
      await clientToUse.from("audit_logs").insert({
        user_id: userId,
        user_name: userName,
        user_role: userRole,
        action: transitionCheck.auditAction || "TRANSITION_STATUS",
        target_type: "episode",
        target_id: episodeId,
        target_title: episodeTitle,
        metadata: {
          fromStatus: currentStatus,
          toStatus,
          rejectionReason,
        },
      });
    }

    return NextResponse.json({
      success: true,
      episodeId,
      status: toStatus,
      message: `Episode status successfully updated to '${toStatus}'.`,
    });
  } catch (error: any) {
    console.error("Publishing workflow error:", error);
    return NextResponse.json(
      { error: "Internal server error processing episode status transition." },
      { status: 500 }
    );
  }
}
