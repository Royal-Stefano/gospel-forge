import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EPISODES as MOCK_EPISODES } from "@/data/mockData";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);

    const slug = searchParams.get("slug");
    const seriesId = searchParams.get("seriesId");
    const category = searchParams.get("category");
    const query = searchParams.get("q");
    const limit = Math.min(Number(searchParams.get("limit") || 20), 50);

    // If Supabase is connected, query published episodes from PostgreSQL
    if (supabase) {
      let dbQuery = supabase
        .from("episodes")
        .select(
          `
          id,
          series_id,
          series_title,
          title,
          slug,
          description,
          show_notes,
          transcript,
          audio_url,
          artwork_url,
          audio_duration_seconds,
          published_at,
          episode_number,
          season_number,
          play_count,
          likes_count,
          featured,
          topics,
          scripture_references,
          speaker:speakers (id, name, role, avatar_url)
        `
        )
        // Public API strictly enforces published status
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(limit);

      if (slug) {
        dbQuery = dbQuery.eq("slug", slug);
      }

      if (seriesId) {
        dbQuery = dbQuery.eq("series_id", seriesId);
      }

      if (query) {
        dbQuery = dbQuery.ilike("title", `%${query}%`);
      }

      const { data, error } = await dbQuery;

      if (error && process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "Database error querying published episodes.", details: error.message },
          { status: 500 }
        );
      }

      if (!error && data) {
        const formatted = data.map((ep: any) => ({
          id: ep.id,
          seriesId: ep.series_id,
          seriesTitle: ep.series_title,
          title: ep.title,
          slug: ep.slug,
          description: ep.description,
          showNotes: ep.show_notes,
          transcript: ep.transcript,
          audioUrl: ep.audio_url,
          artworkUrl: ep.artwork_url,
          durationSeconds: ep.audio_duration_seconds,
          publishedAt: ep.published_at,
          episodeNumber: ep.episode_number,
          seasonNumber: ep.season_number,
          playCount: ep.play_count,
          likesCount: ep.likes_count,
          featured: ep.featured,
          topics: ep.topics || [],
          scriptureReferences: ep.scripture_references || [],
          speaker: ep.speaker,
          status: "published",
        }));

        return NextResponse.json({
          episodes: formatted,
          total: formatted.length,
          source: "database",
        });
      }
    }

    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Database service unavailable in production." },
        { status: 503 }
      );
    }

    // Graceful fallback to verified published mock fixtures strictly in local development
    let filtered = MOCK_EPISODES.filter((ep) => ep.status === "published");

    if (seriesId) {
      filtered = filtered.filter((ep) => ep.seriesId === seriesId);
    }
    if (category) {
      filtered = filtered.filter((ep) => (ep.category || "").toLowerCase() === category.toLowerCase());
    }
    if (query) {
      filtered = filtered.filter(
        (ep) =>
          ep.title.toLowerCase().includes(query.toLowerCase()) ||
          ep.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    return NextResponse.json({
      episodes: filtered.slice(0, limit),
      total: filtered.length,
      source: "fixtures",
    });
  } catch (error) {
    console.error("Public episodes API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch published episodes." },
      { status: 500 }
    );
  }
}
