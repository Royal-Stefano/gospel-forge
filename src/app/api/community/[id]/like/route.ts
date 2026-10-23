import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyServerAuth } from "@/lib/auth/serverAuth";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyServerAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Authentication required to like posts." },
        { status: auth.statusCode || 401 }
      );
    }

    const { id: postId } = await props.params;
    const userId = auth.user.id;

    const adminSupabase: any = getSupabaseAdminClient();
    const supabase = await createSupabaseServerClient();
    const dbClient = adminSupabase || supabase;

    if (!dbClient) {
      return NextResponse.json(
        { error: "Database service unavailable." },
        { status: 503 }
      );
    }

    // Check if currently liked
    const { data: existingLike } = await dbClient
      .from("community_likes")
      .select("user_id")
      .eq("user_id", userId)
      .eq("post_id", postId)
      .maybeSingle();

    let isLiked = false;

    if (existingLike) {
      // Remove like
      await dbClient
        .from("community_likes")
        .delete()
        .eq("user_id", userId)
        .eq("post_id", postId);

      // Decrement count in community_posts
      const { data: post } = await dbClient
        .from("community_posts")
        .select("likes_count")
        .eq("id", postId)
        .single();

      const newCount = Math.max(0, (post?.likes_count || 1) - 1);
      await dbClient
        .from("community_posts")
        .update({ likes_count: newCount })
        .eq("id", postId);

      isLiked = false;
    } else {
      // Add like
      await dbClient
        .from("community_likes")
        .insert({ user_id: userId, post_id: postId });

      // Increment count
      const { data: post } = await dbClient
        .from("community_posts")
        .select("likes_count")
        .eq("id", postId)
        .single();

      const newCount = (post?.likes_count || 0) + 1;
      await dbClient
        .from("community_posts")
        .update({ likes_count: newCount })
        .eq("id", postId);

      isLiked = true;
    }

    return NextResponse.json({ success: true, isLiked });
  } catch (error) {
    console.error("Like toggle error:", error);
    return NextResponse.json(
      { error: "Failed to toggle like on post." },
      { status: 500 }
    );
  }
}
