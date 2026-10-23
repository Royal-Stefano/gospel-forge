import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { verifyServerAuth } from "@/lib/auth/serverAuth";

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyServerAuth(request);
    if (!auth.authenticated || !auth.user) {
      // Progress is only persisted to DB for logged in users
      return NextResponse.json({ authenticated: false, persisted: false });
    }

    const body = await request.json();
    const { episodeId, progressSeconds, completed = false } = body;

    if (!episodeId || typeof progressSeconds !== "number") {
      return NextResponse.json(
        { error: "episodeId and progressSeconds are required." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ persisted: false });
    }

    const userId = auth.user.id;

    // Upsert listening progress
    const { error } = await supabase
      .from("listening_progress")
      .upsert(
        {
          user_id: userId,
          episode_id: episodeId,
          progress_seconds: Math.round(progressSeconds),
          completed: Boolean(completed),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,episode_id" }
      );

    if (error) {
      console.warn("Progress update warning:", error.message);
      return NextResponse.json({ persisted: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ persisted: true });
  } catch (error) {
    console.error("Progress API error:", error);
    return NextResponse.json({ persisted: false }, { status: 500 });
  }
}
