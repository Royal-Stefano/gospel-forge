import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { EPISODES as MOCK_EPISODES } from "@/data/mockData";

export async function GET() {
  const adminSupabase = getSupabaseAdminClient();
  let episodesToFeed: Array<{
    id: string;
    title: string;
    description: string;
    slug: string;
    publishedAt: string;
    audioUrl: string;
    durationSeconds: number;
    speakerName: string;
    artworkUrl: string;
    episodeNumber?: number;
    seasonNumber?: number;
    isExplicit?: boolean;
  }> = [];

  if (adminSupabase) {
    const { data: dbEpisodes, error } = await adminSupabase
      .from("episodes")
      .select(`
        id,
        title,
        description,
        slug,
        published_at,
        audio_url,
        artwork_url,
        audio_duration_seconds,
        episode_number,
        season_number,
        speaker:speakers (name)
      `)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (!error && dbEpisodes) {
      episodesToFeed = dbEpisodes.map((ep: any) => ({
        id: ep.id,
        title: ep.title,
        description: ep.description || "",
        slug: ep.slug,
        publishedAt: ep.published_at,
        audioUrl: ep.audio_url,
        durationSeconds: ep.audio_duration_seconds || 0,
        speakerName: ep.speaker?.name || "Gospel Forge",
        artworkUrl: ep.artwork_url || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=1400",
        episodeNumber: ep.episode_number || 1,
        seasonNumber: ep.season_number || 1,
        isExplicit: false,
      }));
    }
  }

  // If database is not configured or in dev mode fallback
  if (episodesToFeed.length === 0 && process.env.NODE_ENV !== "production") {
    episodesToFeed = MOCK_EPISODES.filter((e) => e.status === "published").map((ep) => ({
      id: ep.id,
      title: ep.title,
      description: ep.description,
      slug: ep.slug,
      publishedAt: ep.publishedAt,
      audioUrl: ep.audioUrl,
      durationSeconds: ep.durationSeconds,
      speakerName: ep.speaker.name,
      artworkUrl: ep.artworkUrl,
      episodeNumber: ep.episodeNumber,
      seasonNumber: ep.seasonNumber,
      isExplicit: ep.isExplicit,
    }));
  }

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Gospel Forge — The Forged Frequency</title>
    <link>https://gospelforge.com</link>
    <language>en-us</language>
    <description>Faith has a frequency. The Word. Amplified. Stream powerful Christian podcasts, biblical teachings, and faith conversations in a cinematic audio universe.</description>
    <itunes:author>Gospel Forge Ministries</itunes:author>
    <itunes:summary>Faith has a frequency. The Word. Amplified.</itunes:summary>
    <itunes:owner>
      <itunes:name>David K. Cole</itunes:name>
      <itunes:email>podcast@gospelforge.com</itunes:email>
    </itunes:owner>
    <itunes:image href="https://images.unsplash.com/photo-1544717305-2782549b5136?w=1400&amp;auto=format&amp;fit=crop&amp;q=80" />
    <itunes:category text="Religion &amp; Spirituality">
      <itunes:category text="Christianity" />
    </itunes:category>
    <itunes:explicit>no</itunes:explicit>

    ${episodesToFeed
      .map(
        (ep) => `
    <item>
      <title><![CDATA[${ep.title}]]></title>
      <description><![CDATA[${ep.description}]]></description>
      <link>https://gospelforge.com/episodes/${ep.slug}</link>
      <guid isPermaLink="false">${ep.id}</guid>
      <pubDate>${new Date(ep.publishedAt || Date.now()).toUTCString()}</pubDate>
      <enclosure url="${ep.audioUrl}" length="42500000" type="audio/mpeg" />
      <itunes:duration>${ep.durationSeconds}</itunes:duration>
      <itunes:author><![CDATA[${ep.speakerName}]]></itunes:author>
      <itunes:image href="${ep.artworkUrl}" />
      <itunes:episode>${ep.episodeNumber || 1}</itunes:episode>
      <itunes:season>${ep.seasonNumber || 1}</itunes:season>
      <itunes:explicit>${ep.isExplicit ? "yes" : "no"}</itunes:explicit>
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=1800, stale-while-revalidate",
    },
  });
}
