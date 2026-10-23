import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);

    const query = (searchParams.get("q") || "").trim();
    const category = searchParams.get("category");
    const type = searchParams.get("type") || "all";
    const limit = Math.min(Number(searchParams.get("limit") || 20), 50);

    if (!query && (!category || category === "All")) {
      return NextResponse.json({
        episodes: [],
        series: [],
        speakers: [],
        total: 0,
      });
    }

    if (!supabase) {
      return NextResponse.json({
        episodes: [],
        series: [],
        speakers: [],
        total: 0,
        source: "database",
      });
    }

    const results: {
      episodes: any[];
      series: any[];
      speakers: any[];
    } = {
      episodes: [],
      series: [],
      speakers: [],
    };

    // 1. Search Published Episodes
    if (type === "all" || type === "episodes") {
      let epQuery = supabase
        .from("episodes")
        .select(`
          id,
          series_id,
          series_title,
          title,
          slug,
          description,
          audio_url,
          artwork_url,
          audio_duration_seconds,
          published_at,
          play_count,
          likes_count,
          topics,
          scripture_references
        `)
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(limit);

      if (query) {
        epQuery = epQuery.or(
          `title.ilike.%${query}%,description.ilike.%${query}%`
        );
      }

      const { data: episodesData } = await epQuery;
      if (episodesData) {
        results.episodes = episodesData.map((ep: any) => ({
          id: ep.id,
          seriesId: ep.series_id,
          seriesTitle: ep.series_title,
          title: ep.title,
          slug: ep.slug,
          description: ep.description,
          audioUrl: ep.audio_url,
          artworkUrl: ep.artwork_url,
          durationSeconds: ep.audio_duration_seconds,
          publishedAt: ep.published_at,
          playCount: ep.play_count,
          likesCount: ep.likes_count,
          topics: ep.topics || [],
          scriptureReferences: ep.scripture_references || [],
        }));
      }
    }

    // 2. Search Series
    if (type === "all" || type === "series") {
      let sQuery = supabase
        .from("series")
        .select(`
          id,
          title,
          slug,
          description,
          artwork_url,
          host_name,
          category
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (query) {
        sQuery = sQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      }

      if (category && category !== "All") {
        sQuery = sQuery.ilike("category", category);
      }

      const { data: seriesData } = await sQuery;
      if (seriesData) {
        results.series = seriesData.map((s: any) => ({
          id: s.id,
          title: s.title,
          slug: s.slug,
          description: s.description,
          artworkUrl: s.artwork_url,
          hostName: s.host_name,
          category: s.category,
        }));
      }
    }

    // 3. Search Speakers
    if ((type === "all" || type === "speakers") && query) {
      const { data: speakerData } = await supabase
        .from("speakers")
        .select("id, name, role, avatar_url, bio")
        .or(`name.ilike.%${query}%,role.ilike.%${query}%`)
        .limit(limit);

      if (speakerData) {
        results.speakers = speakerData.map((sp: any) => ({
          id: sp.id,
          name: sp.name,
          role: sp.role,
          avatarUrl: sp.avatar_url,
          bio: sp.bio,
        }));
      }
    }

    const total =
      results.episodes.length + results.series.length + results.speakers.length;

    return NextResponse.json({
      ...results,
      total,
      source: "database",
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Search failed.", episodes: [], series: [], speakers: [], total: 0 },
      { status: 500 }
    );
  }
}
