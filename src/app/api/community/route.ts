import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyServerAuth } from "@/lib/auth/serverAuth";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const sort = searchParams.get("sort") || "Latest";
    const limit = Math.min(Number(searchParams.get("limit") || 25), 50);

    if (!supabase) {
      return NextResponse.json({
        posts: [],
        total: 0,
        source: "database",
      });
    }

    // Identify requesting user to check if they liked each post
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    let query = supabase
      .from("community_posts")
      .select(`
        id,
        category,
        content,
        scripture_citation,
        attached_episode_id,
        likes_count,
        comments_count,
        is_pinned,
        created_at,
        updated_at,
        author:profiles (id, display_name, username, avatar_url)
      `)
      .limit(limit);

    if (category && category !== "All") {
      query = query.eq("category", category);
    }

    if (sort === "Trending") {
      query = query.order("likes_count", { ascending: false });
    } else {
      query = query.order("is_pinned", { ascending: false }).order("created_at", { ascending: false });
    }

    const { data: posts, error } = await query;

    if (error) {
      console.warn("Community posts query error:", error.message);
      return NextResponse.json({ posts: [], total: 0, source: "database" });
    }

    // Check user likes
    let userLikedPostIds = new Set<string>();
    if (currentUser && posts && posts.length > 0) {
      const postIds = posts.map((p) => p.id);
      const { data: likes } = await supabase
        .from("community_likes")
        .select("post_id")
        .eq("user_id", currentUser.id)
        .in("post_id", postIds);

      if (likes) {
        userLikedPostIds = new Set(likes.map((l) => l.post_id));
      }
    }

    const formattedPosts = (posts || []).map((p: any) => ({
      id: p.id,
      category: p.category,
      content: p.content,
      scriptureCitation: p.scripture_citation,
      attachedEpisodeId: p.attached_episode_id,
      likesCount: p.likes_count || 0,
      repliesCount: p.comments_count || 0,
      isLiked: userLikedPostIds.has(p.id),
      isPinned: p.is_pinned || false,
      createdAt: p.created_at,
      author: {
        id: p.author?.id || "anon",
        name: p.author?.display_name || "Believer",
        username: p.author?.username || "believer",
        avatarUrl:
          p.author?.avatar_url ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      },
    }));

    return NextResponse.json({
      posts: formattedPosts,
      total: formattedPosts.length,
      source: "database",
    });
  } catch (error) {
    console.error("Community GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch community posts.", posts: [], total: 0 },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyServerAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Authentication required to share community posts." },
        { status: auth.statusCode || 401 }
      );
    }

    const body = await request.json();
    const { category, content, scriptureCitation, attachedEpisodeId } = body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Post content cannot be empty." },
        { status: 400 }
      );
    }

    const validCategories = ["Discussions", "Prayer Requests", "Testimonies", "Events"];
    const finalCategory = validCategories.includes(category) ? category : "Discussions";

    const adminSupabase: any = getSupabaseAdminClient();
    const supabase = await createSupabaseServerClient();
    const dbClient = adminSupabase || supabase;

    if (!dbClient) {
      return NextResponse.json(
        { error: "Database service unavailable." },
        { status: 503 }
      );
    }

    const { data: post, error } = await dbClient
      .from("community_posts")
      .insert({
        author_id: auth.user.id,
        category: finalCategory,
        content: content.trim(),
        scripture_citation: scriptureCitation ? scriptureCitation.trim() : null,
        attached_episode_id: attachedEpisodeId || null,
        likes_count: 0,
        comments_count: 0,
      })
      .select(`
        id,
        category,
        content,
        scripture_citation,
        attached_episode_id,
        likes_count,
        comments_count,
        created_at,
        author:profiles (id, display_name, username, avatar_url)
      `)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create post.", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        post: {
          id: post.id,
          category: post.category,
          content: post.content,
          scriptureCitation: post.scripture_citation,
          attachedEpisodeId: post.attached_episode_id,
          likesCount: 0,
          repliesCount: 0,
          isLiked: false,
          createdAt: post.created_at,
          author: {
            id: post.author?.id || auth.user.id,
            name: post.author?.display_name || auth.profile?.display_name || "Believer",
            username: post.author?.username || "believer",
            avatarUrl: post.author?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Community POST error:", error);
    return NextResponse.json(
      { error: "Failed to create community post." },
      { status: 500 }
    );
  }
}
