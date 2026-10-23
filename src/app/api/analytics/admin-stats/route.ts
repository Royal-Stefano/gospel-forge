import { NextRequest, NextResponse } from "next/server";
import { verifyServerAuth } from "@/lib/auth/serverAuth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyServerAuth(request, ["admin", "super_admin"]);
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: "Forbidden: Administrator role required." },
        { status: 403 }
      );
    }

    const adminSupabase: any = getSupabaseAdminClient();

    if (!adminSupabase) {
      return NextResponse.json({
        totalUsers: 0,
        activeListeners: 0,
        verifiedCreators: 0,
        totalEpisodes: 0,
        pendingApplicationsCount: 0,
        totalPlays: 0,
        pendingApplications: [],
      });
    }

    // 1. Total users
    const { count: totalUsers } = await adminSupabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // 2. Active listeners (role = 'listener')
    const { count: activeListeners } = await adminSupabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "listener");

    // 3. Verified creators (artist_status = 'approved')
    const { count: verifiedCreators } = await adminSupabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("artist_status", "approved");

    // 4. Total published episodes
    const { count: totalEpisodes } = await adminSupabase
      .from("episodes")
      .select("*", { count: "exact", head: true })
      .eq("status", "published");

    // 5. Total network plays
    const { count: totalPlays } = await adminSupabase
      .from("play_events")
      .select("*", { count: "exact", head: true });

    // 6. Pending applications
    const { data: pendingApplications, count: pendingCount } = await adminSupabase
      .from("artist_applications")
      .select(`
        id,
        user_id,
        ministry_or_band_name,
        bio,
        sample_audio_link,
        status,
        submitted_at,
        profile:profiles (display_name, avatar_url, email)
      `)
      .eq("status", "pending")
      .order("submitted_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      activeListeners: activeListeners || 0,
      verifiedCreators: verifiedCreators || 0,
      totalEpisodes: totalEpisodes || 0,
      totalPlays: totalPlays || 0,
      pendingApplicationsCount: pendingCount || (pendingApplications || []).length,
      pendingApplications: pendingApplications || [],
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Internal server error fetching admin statistics." },
      { status: 500 }
    );
  }
}
