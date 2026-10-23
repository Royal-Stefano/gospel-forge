import { NextRequest, NextResponse } from "next/server";
import { verifyServerAuth } from "@/lib/auth/serverAuth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { r2Storage } from "@/lib/storage/r2Adapter";
import { z } from "zod";

const VerifySchema = z.object({
  storageKey: z.string().min(1),
  mediaType: z.enum(["audio", "artwork", "banner"]),
});

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyServerAuth(request);
    if (!auth.authenticated || !auth.user || !auth.profile) {
      return NextResponse.json(
        { error: auth.error || "Authentication required." },
        { status: auth.statusCode || 401 }
      );
    }

    const body = await request.json();
    const validation = VerifySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid verification parameters.", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { storageKey, mediaType } = validation.data;
    const adminSupabase: any = getSupabaseAdminClient();

    if (adminSupabase) {
      const { data: asset, error: assetError } = await adminSupabase
        .from("media_assets")
        .select("id, user_id, status, file_size_bytes")
        .eq("storage_key", storageKey)
        .single();

      if (assetError || !asset) {
        return NextResponse.json(
          { error: "Media asset not found in database registry." },
          { status: 404 }
        );
      }

      // Check ownership
      const isOwner = asset.user_id === auth.user.id;
      const isAdmin = ["admin", "super_admin"].includes(auth.profile.role);
      if (!isOwner && !isAdmin) {
        return NextResponse.json(
          { error: "Forbidden: You cannot verify another user's media asset." },
          { status: 403 }
        );
      }

      // Update to verified
      await adminSupabase
        .from("media_assets")
        .update({
          status: "verified",
          verified_at: new Date().toISOString(),
        })
        .eq("storage_key", storageKey);
    }

    return NextResponse.json({
      verified: true,
      storageKey,
      publicDeliveryUrl: r2Storage.getPublicDeliveryUrl(storageKey),
      message: "Media upload verified and registered successfully.",
    });
  } catch (error) {
    console.error("Upload verification error:", error);
    return NextResponse.json(
      { error: "Internal server error verifying media asset." },
      { status: 500 }
    );
  }
}
