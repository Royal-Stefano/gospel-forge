import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({
        authenticated: false,
        savedEpisodes: [],
        listeningProgress: [],
        playlists: [],
      });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        savedEpisodes: [],
        listeningProgress: [],
        playlists: [],
      });
    }

    const userId = user.id;

    // 1. Saved episodes
    const { data: savedRows } = await supabase
      .from("saved_episodes")
      .select(`
        created_at,
        episode:episodes (
          id,
          series_id,
          series_title,
          title,
          slug,
          description,
          audio_url,
          artwork_url,
          audio_duration_seconds,
          published_at
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const savedEpisodes = (savedRows || [])
      .filter((r: any) => r.episode)
      .map((r: any) => ({
        ...r.episode,
        savedAt: r.created_at,
      }));

    // 2. Listening progress
    const { data: progressRows } = await supabase
      .from("listening_progress")
      .select(`
        progress_seconds,
        completed,
        updated_at,
        episode:episodes (
          id,
          series_id,
          series_title,
          title,
          slug,
          description,
          audio_url,
          artwork_url,
          audio_duration_seconds,
          published_at
        )
      `)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    const listeningProgress = (progressRows || [])
      .filter((r: any) => r.episode)
      .map((r: any) => ({
        episode: r.episode,
        progressSeconds: r.progress_seconds,
        completed: r.completed,
        updatedAt: r.updated_at,
      }));

    // 3. Playlists
    const { data: playlistsData } = await supabase
      .from("playlists")
      .select(`
        id,
        title,
        description,
        cover_url,
        is_public,
        created_at
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      authenticated: true,
      savedEpisodes,
      listeningProgress,
      playlists: playlistsData || [],
    });
  } catch (error) {
    console.error("Library GET error:", error);
    return NextResponse.json(
      {
        authenticated: false,
        savedEpisodes: [],
        listeningProgress: [],
        playlists: [],
      },
      { status: 500 }
    );
  }
}
