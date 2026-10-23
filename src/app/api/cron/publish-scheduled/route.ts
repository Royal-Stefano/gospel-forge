import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Secure webhook with bearer token
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized cron trigger." },
        { status: 401 }
      );
    }

    const adminSupabase = getSupabaseAdminClient();

    if (!adminSupabase) {
      return NextResponse.json({
        success: true,
        message: "No database connected. Mock scheduler executed successfully.",
        publishedCount: 0,
      });
    }

    const nowIso = new Date().toISOString();

    // Query all scheduled episodes whose release time has arrived
    const { data: scheduledEpisodes, error: queryError } = await adminSupabase
      .from("episodes")
      .select("id, title, author_id")
      .eq("status", "scheduled")
      .lte("scheduled_publish_at", nowIso);

    if (queryError) {
      return NextResponse.json(
        { error: "Failed to query scheduled episodes.", details: queryError.message },
        { status: 500 }
      );
    }

    if (!scheduledEpisodes || scheduledEpisodes.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No scheduled episodes pending release.",
        publishedCount: 0,
      });
    }

    // Publish each scheduled episode
    const episodeIds = scheduledEpisodes.map((ep) => ep.id);

    const { error: updateError } = await adminSupabase
      .from("episodes")
      .update({
        status: "published",
        published_at: nowIso,
        updated_at: nowIso,
      })
      .in("id", episodeIds);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update scheduled episodes.", details: updateError.message },
        { status: 500 }
      );
    }

    // Log audit events for scheduled publications
    const auditEntries = scheduledEpisodes.map((ep) => ({
      user_name: "Automated Scheduler",
      user_role: "system",
      action: "AUTO_PUBLISH_SCHEDULED",
      target_type: "episode",
      target_id: ep.id,
      target_title: ep.title,
      metadata: { releaseTimestamp: nowIso },
    }));

    await adminSupabase.from("audit_logs").insert(auditEntries);

    return NextResponse.json({
      success: true,
      message: `Successfully released ${episodeIds.length} scheduled episode(s).`,
      publishedCount: episodeIds.length,
      releasedEpisodeIds: episodeIds,
    });
  } catch (error: any) {
    console.error("Scheduled publisher error:", error);
    return NextResponse.json(
      { error: "Internal server error executing scheduled publisher." },
      { status: 500 }
    );
  }
}
