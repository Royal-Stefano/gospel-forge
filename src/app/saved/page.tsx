"use client";

import React from "react";
import { Bookmark } from "lucide-react";
import { EPISODES } from "@/data/mockData";
import { EpisodeCard } from "@/components/podcast/EpisodeCard";
import { useAudioPlayer } from "@/context/AudioPlayerContext";

export default function SavedEpisodesPage() {
  const { savedEpisodeIds } = useAudioPlayer();
  const savedEpisodes = EPISODES.filter((e) => savedEpisodeIds.includes(e.id));
  const displayEpisodes = savedEpisodes.length > 0 ? savedEpisodes : EPISODES.slice(0, 3);

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-[#ff4500]/15 text-[#ff4500] border border-[#ff4500]/30">
          <Bookmark className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-white tracking-wide">
            Saved Episodes
          </h1>
          <p className="text-sm text-[#a5a6af] mt-0.5">
            Episodes you have bookmarked for deep study and re-listening.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayEpisodes.map((ep) => (
          <EpisodeCard key={ep.id} episode={ep} variant="vertical" />
        ))}
      </div>
    </div>
  );
}
