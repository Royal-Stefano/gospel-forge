import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyServerAuth } from "@/lib/auth/serverAuth";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") || 20), 50);

    if (supabase) {
      const { data, error } = await supabase
        .from("speakers")
        .select("id, name, role, avatar_url, bio, created_at")
        .order("name", { ascending: true })
        .limit(limit);

      if (!error && data) {
        const formatted = data.map((s: any) => ({
          id: s.id,
          name: s.name,
          role: s.role,
          avatarUrl: s.avatar_url,
          bio: s.bio,
          seriesCount: 0,
        }));

        return NextResponse.json({
          speakers: formatted,
          total: formatted.length,
          source: "database",
        });
      }
    }

    return NextResponse.json({
      speakers: [],
      total: 0,
      source: "database",
    });
  } catch (error) {
    console.error("Speakers API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch speakers.", speakers: [], total: 0 },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyServerAuth(request, ["admin", "super_admin"]);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Administrator role required." },
        { status: auth.statusCode || 403 }
      );
    }

    const body = await request.json();
    const { name, role, avatarUrl, bio } = body;

    if (!name || !role || !avatarUrl) {
      return NextResponse.json(
        { error: "Name, role, and avatarUrl are required." },
        { status: 400 }
      );
    }

    const adminSupabase = getSupabaseAdminClient();
    if (!adminSupabase) {
      return NextResponse.json(
        { error: "Database service unavailable." },
        { status: 503 }
      );
    }

    const { data, error } = await (adminSupabase as any)
      .from("speakers")
      .insert({
        name,
        role,
        avatar_url: avatarUrl,
        bio: bio || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create speaker.", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, speaker: data }, { status: 201 });
  } catch (error) {
    console.error("Create speaker error:", error);
    return NextResponse.json(
      { error: "Failed to create speaker." },
      { status: 500 }
    );
  }
}
