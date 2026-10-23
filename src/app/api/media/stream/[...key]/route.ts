import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key } = await props.params;
    const storageKey = key.join("/");

    const supabase = await createSupabaseServerClient();
    const adminSupabase: any = getSupabaseAdminClient() || supabase;

    // 1. Server-side object access authorization check
    let isPubliclyAvailable = false;
    let requiredAuthorId: string | null = null;

    if (adminSupabase) {
      // Check if media belongs to a published episode
      const { data: episode } = await adminSupabase
        .from("episodes")
        .select("id, status, author_id")
        .or(`audio_storage_key.eq.${storageKey},artwork_storage_key.eq.${storageKey}`)
        .maybeSingle();

      if (episode) {
        if (episode.status === "published") {
          isPubliclyAvailable = true;
        } else {
          requiredAuthorId = episode.author_id;
        }
      } else {
        // Check standalone media asset
        const { data: asset } = await adminSupabase
          .from("media_assets")
          .select("user_id, status, associated_episode_id")
          .eq("storage_key", storageKey)
          .maybeSingle();

        if (asset) {
          requiredAuthorId = asset.user_id;
        }
      }
    } else {
      // In local development mock mode without database
      isPubliclyAvailable = true;
    }

    // 2. Enforce privacy for unpublished / draft media
    if (!isPubliclyAvailable) {
      let isAuthorized = false;

      if (supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Check if user is author or administrator
          if (requiredAuthorId && user.id === requiredAuthorId) {
            isAuthorized = true;
          } else {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", user.id)
              .single();

            if (profile && ["admin", "super_admin"].includes(profile.role)) {
              isAuthorized = true;
            }
          }
        }
      }

      if (!isAuthorized) {
        return new NextResponse(
          "Forbidden: Private media asset. Access restricted to creator and Gospel Forge administrators.",
          { status: 403 }
        );
      }
    }

    // 3. Stream media with HTTP Range Request support (206 Partial Content)
    const rangeHeader = request.headers.get("range");
    const accountId = process.env.R2_ACCOUNT_ID;
    const bucketName = process.env.R2_BUCKET_NAME || "gospel-forge-media";
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    let upstreamResponse: Response;

    if (accountId && accessKeyId && secretAccessKey) {
      // In production with R2, proxy directly from R2 endpoint with Range headers
      const host = `${bucketName}.${accountId}.r2.cloudflarestorage.com`;
      const url = `https://${host}/${storageKey}`;

      const headers: Record<string, string> = {};
      if (rangeHeader) {
        headers["Range"] = rangeHeader;
      }

      upstreamResponse = await fetch(url, { headers });
    } else {
      // Local fallback test audio
      const sampleAudioUrl =
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
      upstreamResponse = await fetch(sampleAudioUrl, {
        headers: rangeHeader ? { Range: rangeHeader } : {},
      });
    }

    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", storageKey.endsWith(".jpg") || storageKey.endsWith(".jpeg") ? "image/jpeg" : storageKey.endsWith(".png") ? "image/png" : "audio/mpeg");
    responseHeaders.set("Accept-Ranges", "bytes");

    const contentRange = upstreamResponse.headers.get("Content-Range");
    if (contentRange) {
      responseHeaders.set("Content-Range", contentRange);
    }

    const contentLength = upstreamResponse.headers.get("Content-Length");
    if (contentLength) {
      responseHeaders.set("Content-Length", contentLength);
    }

    return new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Audio streaming error:", error);
    return new NextResponse("Failed to stream audio file.", { status: 500 });
  }
}
