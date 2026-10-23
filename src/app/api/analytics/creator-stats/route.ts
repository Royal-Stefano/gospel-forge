import { NextRequest, NextResponse } from "next/server";
import { verifyServerAuth } from "@/lib/auth/serverAuth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyServerAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Authentication required." },
        { status: auth.statusCode || 401 }
      );
    }

    const adminSupabase: any = getSupabaseAdminClient();

    if (!adminSupabase) {
      return NextResponse.json({
        totalPlays: 0,
        uniqueListeners: 0,
        totalFollowers: 0,
        publishedEpisodesCount: 0,
        draftEpisodesCount: 0,
        totalEpisodesCount: 0,
        topEpisodes: [],
      });
    }

    const authorId = auth.user.id;

    // 1. Query all episodes by this creator
    const { data: episodes, error: epError } = await adminSupabase
      .from("episodes")
      .select("id, title, status, play_count, published_at, created_at, artwork_url, slug")
      .eq("author_id", authorId);

    if (epError) {
      return NextResponse.json(
        { error: "Failed to query creator episodes.", details: epError.message },
        { status: 500 }
      );
    }

    const allEpisodes = episodes || [];
    const published = allEpisodes.filter((e: any) => e.status === "published");
    const drafts = allEpisodes.filter((e: any) => e.status === "draft" || e.status === "submitted");

    // Total plays aggregated across episodes
    const totalPlays = allEpisodes.reduce((acc: number, curr: any) => acc + (Number(curr.play_count) || 0), 0);

    // 2. Query unique listeners from play_events
    const { data: playEvents } = await adminSupabase
      .from("play_events")
      .select("session_hash, user_id, created_at, episode_id")
      .eq("author_id", authorId);

    const uniqueHashes = new Set((playEvents || []).map((p: any) => p.user_id || p.session_hash));
    const uniqueListeners = uniqueHashes.size;

    // 3. Query followers
    const { count: followerCount } = await adminSupabase
      .from("followed_series")
      .select("*", { count: "exact", head: true });

    // 4. Top episodes sorted by genuine play count
    const topEpisodes = [...published]
      .sort((a, b) => (b.play_count || 0) - (a.play_count || 0))
      .slice(0, 5)
      .map((ep, idx) => ({
        id: ep.id,
        rank: idx + 1,
        title: ep.title,
        slug: ep.slug,
        artworkUrl: ep.artwork_url,
        plays: ep.play_count,
        formattedPlays: Number(ep.play_count).toLocaleString(),
      }));

    return NextResponse.json({
      totalPlays,
      uniqueListeners,
      totalFollowers: followerCount || 0,
      publishedEpisodesCount: published.length,
      draftEpisodesCount: drafts.length,
      totalEpisodesCount: allEpisodes.length,
      topEpisodes,
    });
  } catch (error) {
    console.error("Creator stats error:", error);
    return NextResponse.json(
      { error: "Internal server error fetching creator statistics." },
      { status: 500 }
    );
  }
}
