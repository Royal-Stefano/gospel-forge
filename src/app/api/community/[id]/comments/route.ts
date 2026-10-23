import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyServerAuth } from "@/lib/auth/serverAuth";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id: postId } = await props.params;

    if (!supabase) {
      return NextResponse.json({ comments: [] });
    }

    const { data: comments, error } = await supabase
      .from("community_comments")
      .select(`
        id,
        content,
        created_at,
        author:profiles (id, display_name, username, avatar_url)
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ comments: [] });
    }

    const formatted = (comments || []).map((c: any) => ({
      id: c.id,
      content: c.content,
      createdAt: c.created_at,
      author: {
        id: c.author?.id || "anon",
        name: c.author?.display_name || "Believer",
        username: c.author?.username || "believer",
        avatarUrl: c.author?.avatar_url,
      },
    }));

    return NextResponse.json({ comments: formatted });
  } catch (error) {
    console.error("Comments GET error:", error);
    return NextResponse.json({ comments: [] }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyServerAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Authentication required to comment." },
        { status: auth.statusCode || 401 }
      );
    }

    const { id: postId } = await props.params;
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Comment text cannot be empty." },
        { status: 400 }
      );
    }

    const adminSupabase: any = getSupabaseAdminClient();
    const supabase = await createSupabaseServerClient();
    const dbClient = adminSupabase || supabase;

    if (!dbClient) {
      return NextResponse.json(
        { error: "Database service unavailable." },
        { status: 503 }
      );
    }

    const { data: comment, error } = await dbClient
      .from("community_comments")
      .insert({
        post_id: postId,
        author_id: auth.user.id,
        content: content.trim(),
      })
      .select(`
        id,
        content,
        created_at,
        author:profiles (id, display_name, username, avatar_url)
      `)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to post comment.", details: error.message },
        { status: 500 }
      );
    }

    // Increment comments_count on community_posts
    const { data: post } = await dbClient
      .from("community_posts")
      .select("comments_count")
      .eq("id", postId)
      .single();

    const newCount = (post?.comments_count || 0) + 1;
    await dbClient
      .from("community_posts")
      .update({ comments_count: newCount })
      .eq("id", postId);

    return NextResponse.json(
      {
        success: true,
        comment: {
          id: comment.id,
          content: comment.content,
          createdAt: comment.created_at,
          author: {
            id: comment.author?.id || auth.user.id,
            name: comment.author?.display_name || auth.profile?.display_name || "Believer",
            username: comment.author?.username || "believer",
            avatarUrl: comment.author?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Comment POST error:", error);
    return NextResponse.json(
      { error: "Failed to create comment." },
      { status: 500 }
    );
  }
}
