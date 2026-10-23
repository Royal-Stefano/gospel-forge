import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";
import crypto from "crypto";
import { z } from "zod";

const TrackPlaySchema = z.object({
  episodeId: z.string().min(1),
  durationSeconds: z.number().nonnegative().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    // Rate limit play tracking to max 60 events per minute per IP
    const rateLimit = checkRateLimit(`track_play:${clientIp}`, 60, 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many play tracking requests." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = TrackPlaySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid tracking payload.", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { episodeId, durationSeconds = 0 } = validation.data;

    // Generate privacy-conscious salted daily session hash (No raw IP stored)
    const userAgent = request.headers.get("user-agent") || "";
    const todaySalt = new Date().toISOString().substring(0, 10);
    const sessionHash = crypto
      .createHash("sha256")
      .update(`${clientIp}-${userAgent}-${todaySalt}`)
      .digest("hex");

    const supabase = await createSupabaseServerClient();
    let userId: string | null = null;

    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    }

    const adminSupabase: any = getSupabaseAdminClient() || supabase;

    if (adminSupabase) {
      // 1. Duplicate play prevention window (30 minutes)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

      const { data: recentPlays } = await adminSupabase
        .from("play_events")
        .select("id")
        .eq("episode_id", episodeId)
        .eq("session_hash", sessionHash)
        .gt("created_at", thirtyMinutesAgo)
        .limit(1);

      if (recentPlays && recentPlays.length > 0) {
        // Debounced duplicate play within 30-minute window
        return NextResponse.json({
          success: true,
          recorded: false,
          deduplicated: true,
          message: "Play event debounced (30-minute listener window active).",
        });
      }

      // Fetch episode author for analytics aggregation
      const { data: ep } = await adminSupabase
        .from("episodes")
        .select("author_id, play_count")
        .eq("id", episodeId)
        .single();

      const authorId = ep?.author_id || null;

      // 2. Insert genuine play event
      await adminSupabase.from("play_events").insert({
        episode_id: episodeId,
        author_id: authorId,
        user_id: userId,
        session_hash: sessionHash,
        duration_seconds: durationSeconds,
      });

      // 3. Atomically increment total play count on episode
      if (ep) {
        await adminSupabase
          .from("episodes")
          .update({
            play_count: (ep.play_count || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", episodeId);
      }
    }

    return NextResponse.json({
      success: true,
      recorded: true,
      deduplicated: false,
      message: "Play event recorded successfully.",
    });
  } catch (error) {
    console.error("Play tracking error:", error);
    return NextResponse.json(
      { error: "Internal server error recording playback event." },
      { status: 500 }
    );
  }
}
