import { NextResponse } from "next/server";
import { EPISODES, SERIES_LIST } from "@/data/mockData";

export async function GET() {
  const publishedEpisodes = EPISODES.filter((e) => e.status !== "draft" && e.status !== "archived");

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

    ${publishedEpisodes
      .map(
        (ep) => `
    <item>
      <title><![CDATA[${ep.title}]]></title>
      <description><![CDATA[${ep.description}]]></description>
      <link>https://gospelforge.com/episodes/${ep.slug}</link>
      <guid isPermaLink="false">${ep.id}</guid>
      <pubDate>${new Date(ep.publishedAt).toUTCString()}</pubDate>
      <enclosure url="${ep.audioUrl}" length="42500000" type="audio/mpeg" />
      <itunes:duration>${ep.durationSeconds}</itunes:duration>
      <itunes:author><![CDATA[${ep.speaker.name}]]></itunes:author>
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
