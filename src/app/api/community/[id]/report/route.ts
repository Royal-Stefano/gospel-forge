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
        { error: auth.error || "Authentication required to submit report." },
        { status: auth.statusCode || 401 }
      );
    }

    const { id: targetId } = await props.params;
    const body = await request.json();
    const { reason, targetType = "post" } = body;

    if (!reason || typeof reason !== "string" || !reason.trim()) {
      return NextResponse.json(
        { error: "Reason for report is required." },
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

    const { data, error } = await dbClient
      .from("community_reports")
      .insert({
        reporter_id: auth.user.id,
        target_id: targetId,
        target_type: targetType,
        reason: reason.trim(),
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to submit report.", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, report: data }, { status: 201 });
  } catch (error) {
    console.error("Report submission error:", error);
    return NextResponse.json(
      { error: "Failed to report content." },
      { status: 500 }
    );
  }
}
