import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyServerAuth } from "@/lib/auth/serverAuth";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const query = searchParams.get("q");
    const limit = Math.min(Number(searchParams.get("limit") || 20), 50);

    if (supabase) {
      let dbQuery = supabase
        .from("series")
        .select(`
          id,
          title,
          slug,
          description,
          artwork_url,
          banner_url,
          host_name,
          category,
          featured,
          created_at,
          speaker:speakers (id, name, role, avatar_url)
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (category && category !== "All") {
        dbQuery = dbQuery.ilike("category", category);
      }

      if (featured === "true") {
        dbQuery = dbQuery.eq("featured", true);
      }

      if (query) {
        dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      }

      const { data, error } = await dbQuery;

      if (!error && data) {
        const formatted = data.map((s: any) => ({
          id: s.id,
          title: s.title,
          slug: s.slug,
          description: s.description,
          artworkUrl: s.artwork_url,
          bannerUrl: s.banner_url,
          hostName: s.host_name,
          category: s.category,
          featured: s.featured,
          createdAt: s.created_at,
          speaker: s.speaker,
        }));

        return NextResponse.json({
          series: formatted,
          total: formatted.length,
          source: "database",
        });
      }
    }

    // In production without records, return clean empty list
    return NextResponse.json({
      series: [],
      total: 0,
      source: "database",
    });
  } catch (error) {
    console.error("Series API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch series.", series: [], total: 0 },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyServerAuth(request, ["editor", "admin", "super_admin"]);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Permission denied: Creator or Admin role required." },
        { status: auth.statusCode || 403 }
      );
    }

    const body = await request.json();
    const { title, description, artworkUrl, category, hostName, bannerUrl } = body;

    if (!title || !description || !artworkUrl || !category) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, artworkUrl, and category are required." },
        { status: 400 }
      );
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const adminSupabase = getSupabaseAdminClient();
    if (!adminSupabase) {
      return NextResponse.json(
        { error: "Database service unavailable." },
        { status: 503 }
      );
    }

    const { data, error } = await (adminSupabase as any)
      .from("series")
      .insert({
        title,
        slug,
        description,
        artwork_url: artworkUrl,
        banner_url: bannerUrl || null,
        host_name: hostName || auth.profile?.display_name || "Gospel Forge Host",
        author_id: auth.user.id,
        category,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create series.", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, series: data }, { status: 201 });
  } catch (error) {
    console.error("Create series error:", error);
    return NextResponse.json(
      { error: "Failed to create series." },
      { status: 500 }
    );
  }
}
