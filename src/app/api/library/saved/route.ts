import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { verifyServerAuth } from "@/lib/auth/serverAuth";

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyServerAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Authentication required to bookmark episodes." },
        { status: auth.statusCode || 401 }
      );
    }

    const body = await request.json();
    const { episodeId } = body;

    if (!episodeId) {
      return NextResponse.json(
        { error: "episodeId is required." },
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

    const userId = auth.user.id;

    // Check if currently saved
    const { data: existing } = await supabase
      .from("saved_episodes")
      .select("episode_id")
      .eq("user_id", userId)
      .eq("episode_id", episodeId)
      .maybeSingle();

    let isSaved = false;

    if (existing) {
      await supabase
        .from("saved_episodes")
        .delete()
        .eq("user_id", userId)
        .eq("episode_id", episodeId);
      isSaved = false;
    } else {
      await supabase
        .from("saved_episodes")
        .insert({ user_id: userId, episode_id: episodeId });
      isSaved = true;
    }

    return NextResponse.json({ success: true, isSaved });
  } catch (error) {
    console.error("Saved episode toggle error:", error);
    return NextResponse.json(
      { error: "Failed to toggle saved episode." },
      { status: 500 }
    );
  }
}
