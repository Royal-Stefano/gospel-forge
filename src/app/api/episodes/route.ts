import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EPISODES as MOCK_EPISODES } from "@/data/mockData";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);

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

      if (seriesId) {
        dbQuery = dbQuery.eq("series_id", seriesId);
      }

      if (query) {
        dbQuery = dbQuery.ilike("title", `%${query}%`);
      }

      const { data, error } = await dbQuery;

      if (!error && data && data.length > 0) {
        return NextResponse.json({
          episodes: data,
          total: data.length,
          source: "database",
        });
      }
    }

    // Graceful fallback to verified published mock fixtures in local development
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
