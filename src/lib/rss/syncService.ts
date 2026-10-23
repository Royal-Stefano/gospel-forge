import { XMLParser } from "fast-xml-parser";
import { z } from "zod";

const RssItemSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  guid: z.union([z.string(), z.object({ "#text": z.string() })]),
  pubDate: z.string(),
  enclosure: z
    .object({
      "@_url": z.string().url(),
      "@_type": z.string().optional(),
      "@_length": z.union([z.string(), z.number()]).optional(),
    })
    .optional(),
  "itunes:duration": z.union([z.string(), z.number()]).optional(),
  "itunes:image": z
    .object({
      "@_href": z.string().url().optional(),
    })
    .optional(),
  "itunes:episode": z.union([z.string(), z.number()]).optional(),
  "itunes:season": z.union([z.string(), z.number()]).optional(),
});

export interface ParsedEpisode {
  guid: string;
  title: string;
  description: string;
  audioUrl: string;
  artworkUrl: string;
  publishedAt: string;
  durationSeconds: number;
  episodeNumber?: number;
  seasonNumber?: number;
}

export async function parseRssFeed(xmlText: string): Promise<ParsedEpisode[]> {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
  });

  const parsed = parser.parse(xmlText);
  const channel = parsed?.rss?.channel;
  if (!channel || !channel.item) {
    throw new Error("Invalid RSS feed format: channel or items missing");
  }

  const rawItems = Array.isArray(channel.item) ? channel.item : [channel.item];
  const channelImage = channel["itunes:image"]?.["@_href"] || channel.image?.url;

  const results: ParsedEpisode[] = [];

  for (const item of rawItems) {
    try {
      const validated = RssItemSchema.safeParse(item);
      if (!validated.success) continue;

      const data = validated.data;
      const guid =
        typeof data.guid === "string" ? data.guid : data.guid["#text"];

      const audioUrl = data.enclosure?.["@_url"] || "";
      if (!audioUrl) continue;

      // Parse duration
      let durationSeconds = 0;
      if (typeof data["itunes:duration"] === "number") {
        durationSeconds = data["itunes:duration"];
      } else if (typeof data["itunes:duration"] === "string") {
        const parts = data["itunes:duration"].split(":").map(Number);
        if (parts.length === 3) {
          durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
          durationSeconds = parts[0] * 60 + parts[1];
        } else if (!isNaN(Number(data["itunes:duration"]))) {
          durationSeconds = Number(data["itunes:duration"]);
        }
      }

      const artworkUrl =
        data["itunes:image"]?.["@_href"] ||
        channelImage ||
        "/images/gospel-forge-emblem.jpg";

      results.push({
        guid,
        title: data.title,
        description: data.description || "",
        audioUrl,
        artworkUrl,
        publishedAt: new Date(data.pubDate).toISOString(),
        durationSeconds,
        episodeNumber: data["itunes:episode"]
          ? Number(data["itunes:episode"])
          : undefined,
        seasonNumber: data["itunes:season"]
          ? Number(data["itunes:season"])
          : undefined,
      });
    } catch {
      // Continue parsing other items safely
    }
  }

  return results;
}
