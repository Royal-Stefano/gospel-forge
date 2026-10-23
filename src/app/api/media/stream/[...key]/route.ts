import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key } = await props.params;
    const storageKey = key.join("/");

    // If upstream Cloudflare R2 public URL is configured, redirect to CDN directly
    const publicCdnUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    if (publicCdnUrl) {
      return NextResponse.redirect(`${publicCdnUrl}/${storageKey}`, 307);
    }

    // In local dev without R2 CDN, return range-enabled response from sample audio
    const sampleAudioUrl =
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
    const rangeHeader = request.headers.get("range");

    const upstreamResponse = await fetch(sampleAudioUrl, {
      headers: rangeHeader ? { Range: rangeHeader } : {},
    });

    const headers = new Headers();
    headers.set("Content-Type", "audio/mpeg");
    headers.set("Accept-Ranges", "bytes");

    const contentRange = upstreamResponse.headers.get("Content-Range");
    if (contentRange) {
      headers.set("Content-Range", contentRange);
    }

    const contentLength = upstreamResponse.headers.get("Content-Length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    return new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers,
    });
  } catch (error) {
    console.error("Audio streaming error:", error);
    return new NextResponse("Failed to stream audio file.", { status: 500 });
  }
}
