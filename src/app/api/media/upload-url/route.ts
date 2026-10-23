import { NextRequest, NextResponse } from "next/server";
import { verifyServerAuth } from "@/lib/auth/serverAuth";
import { r2Storage } from "@/lib/storage/r2Adapter";
import { STORAGE_LIMITS } from "@/lib/storage/types";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";
import { z } from "zod";

const UploadUrlSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileSizeBytes: z.number().positive(),
  contentType: z.string().min(1),
  mediaType: z.enum(["audio", "artwork", "banner"]),
});

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`upload_url:${clientIp}`, 20, 600);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Upload rate limit exceeded. Please wait a few minutes." },
        { status: 429 }
      );
    }

    // Require verified authentication
    const auth = await verifyServerAuth(request);
    if (!auth.authenticated || !auth.user || !auth.profile) {
      return NextResponse.json(
        { error: auth.error || "Authentication required to upload media." },
        { status: auth.statusCode || 401 }
      );
    }

    const isApprovedArtist =
      auth.profile.artist_status === "approved" ||
      ["editor", "admin", "super_admin"].includes(auth.profile.role);

    if (!isApprovedArtist) {
      return NextResponse.json(
        {
          error:
            "Creator authorization required. Pending artists and listeners cannot upload media until approved by Gospel Forge administrators.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = UploadUrlSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid upload parameters.", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { fileName, fileSizeBytes, contentType, mediaType } = validation.data;

    // Enforce size constraints
    if (mediaType === "audio" && fileSizeBytes > STORAGE_LIMITS.AUDIO_MAX_BYTES) {
      return NextResponse.json(
        {
          error: `Audio file exceeds maximum size limit of ${
            STORAGE_LIMITS.AUDIO_MAX_BYTES / (1024 * 1024)
          } MB.`,
        },
        { status: 400 }
      );
    }

    if (
      (mediaType === "artwork" || mediaType === "banner") &&
      fileSizeBytes > STORAGE_LIMITS.ARTWORK_MAX_BYTES
    ) {
      return NextResponse.json(
        {
          error: `Image file exceeds maximum size limit of ${
            STORAGE_LIMITS.ARTWORK_MAX_BYTES / (1024 * 1024)
          } MB.`,
        },
        { status: 400 }
      );
    }

    // Enforce MIME type constraints
    if (
      mediaType === "audio" &&
      !STORAGE_LIMITS.ALLOWED_AUDIO_MIME_TYPES.includes(contentType.toLowerCase())
    ) {
      return NextResponse.json(
        {
          error: `Unsupported audio MIME type: ${contentType}. Supported formats: MP3, WAV, M4A.`,
        },
        { status: 400 }
      );
    }

    if (
      (mediaType === "artwork" || mediaType === "banner") &&
      !STORAGE_LIMITS.ALLOWED_IMAGE_MIME_TYPES.includes(contentType.toLowerCase())
    ) {
      return NextResponse.json(
        {
          error: `Unsupported image MIME type: ${contentType}. Supported formats: JPG, PNG, WebP.`,
        },
        { status: 400 }
      );
    }

    // Generate secure short-lived presigned upload URL
    const presignedData = await r2Storage.generatePresignedUploadUrl({
      fileName,
      fileSizeBytes,
      contentType,
      mediaType,
      userId: auth.user.id,
    });

    const adminSupabase: any = getSupabaseAdminClient();
    if (adminSupabase) {
      await adminSupabase.from("media_assets").insert({
        user_id: auth.user.id,
        storage_key: presignedData.storageKey,
        bucket_name: process.env.R2_BUCKET_NAME || "gospel-forge-media",
        file_name: fileName,
        file_size_bytes: fileSizeBytes,
        content_type: contentType,
        media_type: mediaType,
        status: "pending_upload",
      });
    }

    return NextResponse.json({
      success: true,
      uploadUrl: presignedData.uploadUrl,
      storageKey: presignedData.storageKey,
      publicDeliveryUrl: presignedData.publicDeliveryUrl,
      expiresInSeconds: presignedData.expiresInSeconds,
      headers: presignedData.headers,
    });
  } catch (error: any) {
    console.error("Presigned upload generation error:", error);
    return NextResponse.json(
      { error: "Internal server error generating presigned upload authorization." },
      { status: 500 }
    );
  }
}
