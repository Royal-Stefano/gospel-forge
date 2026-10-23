import { NextRequest, NextResponse } from "next/server";
import { verifyServerAuth } from "@/lib/auth/serverAuth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyServerAuth(request, ["admin", "super_admin"]);
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: "Forbidden: Administrator privileges required to inspect storage usage." },
        { status: 403 }
      );
    }

    const adminSupabase: any = getSupabaseAdminClient();
    if (!adminSupabase) {
      // Mock metrics for development dashboard
      return NextResponse.json({
        totalStorageBytes: 1542000000,
        totalStorageFormatted: "1.54 GB",
        audioBytes: 1420000000,
        artworkBytes: 122000000,
        totalAssets: 48,
        activeEpisodesWithMedia: 24,
      });
    }

    const { data: assets, error } = await adminSupabase
      .from("media_assets")
      .select("file_size_bytes, media_type, status");

    if (error) {
      return NextResponse.json(
        { error: "Failed to aggregate storage usage.", details: error.message },
        { status: 500 }
      );
    }

    let totalAudioBytes = 0;
    let totalArtworkBytes = 0;
    let totalBannerBytes = 0;

    (assets || []).forEach((a: any) => {
      const bytes = Number(a.file_size_bytes) || 0;
      if (a.media_type === "audio") totalAudioBytes += bytes;
      else if (a.media_type === "artwork") totalArtworkBytes += bytes;
      else if (a.media_type === "banner") totalBannerBytes += bytes;
    });

    const totalBytes = totalAudioBytes + totalArtworkBytes + totalBannerBytes;
    const formattedGb = (totalBytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";

    return NextResponse.json({
      totalStorageBytes: totalBytes,
      totalStorageFormatted: formattedGb,
      audioBytes: totalAudioBytes,
      artworkBytes: totalArtworkBytes,
      bannerBytes: totalBannerBytes,
      totalAssets: (assets || []).length,
      bucketName: process.env.R2_BUCKET_NAME || "gospel-forge-media",
    });
  } catch (error) {
    console.error("Storage usage query error:", error);
    return NextResponse.json(
      { error: "Internal server error querying storage metrics." },
      { status: 500 }
    );
  }
}
