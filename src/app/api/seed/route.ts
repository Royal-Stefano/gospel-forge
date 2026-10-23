import { NextRequest, NextResponse } from "next/server";
import { verifyServerAuth } from "@/lib/auth/serverAuth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { SPEAKERS, SERIES_LIST, EPISODES } from "@/data/mockData";

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyServerAuth(request, ["admin", "super_admin"]);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Administrator role required to seed database." },
        { status: auth.statusCode || 403 }
      );
    }

    const adminSupabase: any = getSupabaseAdminClient();
    if (!adminSupabase) {
      return NextResponse.json(
        { error: "Database service unavailable." },
        { status: 503 }
      );
    }

    const currentUserId = auth.user.id;

    // 1. Seed Speakers
    const speakerMap: Record<string, string> = {};
    for (const sp of SPEAKERS) {
      // Check if speaker exists by name
      const { data: existing } = await adminSupabase
        .from("speakers")
        .select("id")
        .eq("name", sp.name)
        .maybeSingle();

      if (existing) {
        speakerMap[sp.name] = existing.id;
      } else {
        const { data: created, error } = await adminSupabase
          .from("speakers")
          .insert({
            name: sp.name,
            role: sp.role,
            avatar_url: sp.avatarUrl,
            bio: sp.bio,
          })
          .select("id")
          .single();

        if (created && !error) {
          speakerMap[sp.name] = created.id;
        }
      }
    }

    // 2. Seed Series
    const seriesMap: Record<string, string> = {};
    for (const s of SERIES_LIST) {
      const { data: existing } = await adminSupabase
        .from("series")
        .select("id")
        .eq("slug", s.slug)
        .maybeSingle();

      if (existing) {
        seriesMap[s.id] = existing.id;
      } else {
        const speakerId = speakerMap[s.hostName] || null;
        const { data: created, error } = await adminSupabase
          .from("series")
          .insert({
            title: s.title,
            slug: s.slug,
            description: s.description,
            artwork_url: s.artworkUrl,
            banner_url: s.bannerUrl || null,
            host_name: s.hostName,
            host_id: speakerId,
            author_id: currentUserId,
            category: s.category,
            featured: s.featured || false,
          })
          .select("id")
          .single();

        if (created && !error) {
          seriesMap[s.id] = created.id;
        }
      }
    }

    // 3. Seed Episodes
    let seededEpisodesCount = 0;
    for (const ep of EPISODES) {
      const { data: existing } = await adminSupabase
        .from("episodes")
        .select("id")
        .eq("slug", ep.slug)
        .maybeSingle();

      if (!existing) {
        const dbSeriesId = seriesMap[ep.seriesId] || Object.values(seriesMap)[0];
        if (!dbSeriesId) continue;

        const speakerId = ep.speaker ? speakerMap[ep.speaker.name] || null : null;

        const { error } = await adminSupabase.from("episodes").insert({
          series_id: dbSeriesId,
          series_title: ep.seriesTitle,
          title: ep.title,
          slug: ep.slug,
          description: ep.description,
          show_notes: ep.showNotes || null,
          transcript: ep.transcript || null,
          audio_url: ep.audioUrl,
          audio_duration_seconds: ep.durationSeconds,
          audio_file_size_bytes: 42000000,
          artwork_url: ep.artworkUrl,
          status: "published",
          episode_number: ep.episodeNumber || 1,
          season_number: ep.seasonNumber || 1,
          author_id: currentUserId,
          speaker_id: speakerId,
          topics: ep.topics || [],
          scripture_references: ep.scriptureReferences || [],
          play_count: 0,
          likes_count: 0,
          featured: ep.featured || false,
          published_at: ep.publishedAt || new Date().toISOString(),
        });

        if (!error) {
          seededEpisodesCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Database populated: ${Object.keys(speakerMap).length} speakers, ${Object.keys(seriesMap).length} series, ${seededEpisodesCount} episodes created.`,
      speakersSeeded: Object.keys(speakerMap).length,
      seriesSeeded: Object.keys(seriesMap).length,
      episodesSeeded: seededEpisodesCount,
    });
  } catch (error) {
    console.error("Seed API error:", error);
    return NextResponse.json(
      { error: "Failed to seed database." },
      { status: 500 }
    );
  }
}
