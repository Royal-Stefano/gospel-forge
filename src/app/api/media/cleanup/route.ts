import { NextRequest, NextResponse } from "next/server";
import { verifyServerAuth } from "@/lib/auth/serverAuth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { r2Storage } from "@/lib/storage/r2Adapter";

export async function POST(request: NextRequest) {
  try {
    // Only administrators or scheduled system jobs can trigger cleanup
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const isCronAuthorized = cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!isCronAuthorized) {
      const auth = await verifyServerAuth(request, ["admin", "super_admin"]);
      if (!auth.authenticated) {
        return NextResponse.json(
          { error: "Forbidden: Administrator privileges required for storage cleanup." },
          { status: 403 }
        );
      }
    }

    const adminSupabase: any = getSupabaseAdminClient();
    if (!adminSupabase) {
      return NextResponse.json({
        success: true,
        cleanedCount: 0,
        message: "No database connected. Mock cleanup executed.",
      });
    }

    // Find pending uploads older than 24 hours that were never verified or attached to an episode
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: abandonedAssets, error: queryError } = await adminSupabase
      .from("media_assets")
      .select("id, storage_key")
      .eq("status", "pending_upload")
      .is("associated_episode_id", null)
      .lt("created_at", oneDayAgo);

    if (queryError) {
      return NextResponse.json(
        { error: "Failed to query abandoned assets.", details: queryError.message },
        { status: 500 }
      );
    }

    let cleanedCount = 0;
    if (abandonedAssets && abandonedAssets.length > 0) {
      for (const asset of abandonedAssets) {
        await r2Storage.deleteObject(asset.storage_key);
        cleanedCount++;
      }

      const assetIds = abandonedAssets.map((a: any) => a.id);
      await adminSupabase
        .from("media_assets")
        .update({ status: "abandoned" })
        .in("id", assetIds);
    }

    return NextResponse.json({
      success: true,
      cleanedCount,
      message: `Cleaned up ${cleanedCount} abandoned media assets.`,
    });
  } catch (error) {
    console.error("Storage cleanup error:", error);
    return NextResponse.json(
      { error: "Internal server error during storage cleanup." },
      { status: 500 }
    );
  }
}
