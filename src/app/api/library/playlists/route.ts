import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { verifyServerAuth } from "@/lib/auth/serverAuth";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return NextResponse.json({ playlists: [] });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ playlists: [] });

    const { data, error } = await supabase
      .from("playlists")
      .select("id, title, description, cover_url, is_public, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ playlists: [] });

    return NextResponse.json({ playlists: data || [] });
  } catch (error) {
    return NextResponse.json({ playlists: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyServerAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Authentication required." },
        { status: auth.statusCode || 401 }
      );
    }

    const body = await request.json();
    const { title, description, coverUrl, isPublic = true } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Playlist title cannot be empty." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database service unavailable." },
        { status: 503 }
      );
    }

    const { data, error } = await supabase
      .from("playlists")
      .insert({
        user_id: auth.user.id,
        title: title.trim(),
        description: description ? description.trim() : null,
        cover_url: coverUrl || null,
        is_public: isPublic,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create playlist.", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, playlist: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create playlist." },
      { status: 500 }
    );
  }
}
