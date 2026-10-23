"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Play,
  Pause,
  ChevronRight,
  MoreHorizontal,
  Flame,
  Radio,
} from "lucide-react";
import { CinematicHero } from "@/components/home/CinematicHero";
import { SERIES_LIST, EPISODES } from "@/data/mockData";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { formatTime } from "@/lib/utils";

export default function HomePage() {
  const { currentEpisode, isPlaying, togglePlay, playEpisode } = useAudioPlayer();

  // First 6 series for the Featured Podcasts section
  const featuredSeries = SERIES_LIST.slice(0, 6);

  // 3 latest episodes for the Latest Episodes section
  const latestEpisodes = EPISODES.slice(0, 3);

  const handleEpisodePlay = (e: React.MouseEvent, episode: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentEpisode?.id === episode.id) {
      togglePlay();
    } else {
      playEpisode(episode);
    }
  };

  const handleSeriesPlay = (e: React.MouseEvent, series: any) => {
    e.preventDefault();
    e.stopPropagation();
    // Play first episode of that series
    const targetEpisode =
      EPISODES.find((ep) => ep.seriesId === series.id) || EPISODES[0];
    if (currentEpisode?.id === targetEpisode.id) {
      togglePlay();
    } else {
      playEpisode(targetEpisode);
    }
  };

  return (
    <div className="space-y-10 pb-12">
      {/* 1. CINEMATIC HERO */}
      <CinematicHero />

      {/* 2. FEATURED PODCASTS SECTION */}
      <section className="px-4 md:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg sm:text-xl font-bold text-white tracking-tight">
            Featured Podcasts
          </h2>
          <Link
            href="/browse"
            className="text-xs text-[#a5a6af] hover:text-[#ffb13b] flex items-center gap-1 font-sans transition-colors"
          >
            See all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 6 Square Featured Podcast Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {featuredSeries.map((series) => {
            const isPlayingThis =
              isPlaying && currentEpisode?.seriesId === series.id;

            return (
              <div
                key={series.id}
                className="group flex flex-col cursor-pointer"
                onClick={(e) => handleSeriesPlay(e, series)}
              >
                {/* Artwork Container */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-2.5 border border-[#222125] bg-[#141315] shadow-lg group-hover:border-[#ff4500]/50 transition-all duration-300">
                  <Image
                    src={series.artworkUrl}
                    alt={series.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Circular Yellow Play Button (floating in bottom right corner) */}
                  <button
                    onClick={(e) => handleSeriesPlay(e, series)}
                    className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-[#f5a623] hover:bg-[#ffb13b] text-black flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95 z-10"
                    aria-label={`Play ${series.title}`}
                  >
                    {isPlayingThis ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                </div>

                {/* Podcast Info */}
                <h3 className="font-heading text-xs sm:text-sm font-bold text-white group-hover:text-[#ffb13b] transition-colors truncate">
                  {series.title}
                </h3>
                <p className="text-[11px] text-[#a5a6af] truncate">
                  {series.hostName}
                </p>
                <p className="text-[10px] text-[#6e6f77] mt-0.5">
                  {series.episodeCount} episodes
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. LATEST EPISODES SECTION */}
      <section className="px-4 md:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg sm:text-xl font-bold text-white tracking-tight">
            Latest Episodes
          </h2>
          <Link
            href="/browse"
            className="text-xs text-[#a5a6af] hover:text-[#ffb13b] flex items-center gap-1 font-sans transition-colors"
          >
            See all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3 Horizontal Latest Episode Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {latestEpisodes.map((episode) => {
            const isPlayingThis =
              isPlaying && currentEpisode?.id === episode.id;

            return (
              <div
                key={episode.id}
                className="group relative flex items-center gap-3.5 p-3 rounded-2xl bg-[#111013]/90 hover:bg-[#18171b] border border-[#222125] hover:border-[#ff4500]/40 transition-all duration-300 shadow-md"
              >
                {/* Left Thumbnail */}
                <Link
                  href={`/episodes/${episode.slug}`}
                  className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-[#2a292f] bg-[#161418]"
                >
                  <Image
                    src={episode.artworkUrl}
                    alt={episode.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                {/* Center Content */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/episodes/${episode.slug}`}
                    className="block font-heading text-xs sm:text-sm font-bold text-white group-hover:text-[#ffb13b] transition-colors truncate"
                  >
                    {episode.title}
                  </Link>
                  <p className="text-[11px] text-[#a5a6af] truncate">
                    {episode.seriesTitle}
                  </p>
                  <p className="text-[11px] text-[#6e6f77] line-clamp-1 mt-0.5">
                    {episode.description}
                  </p>
                  <p className="text-[10px] text-[#6e6f77] mt-1 font-mono">
                    {episode.publishedAt.slice(0, 10)} • {Math.round(episode.durationSeconds / 60)} min
                  </p>
                </div>

                {/* Right Action Icons: Three Dots & Circular Yellow Play Button */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    className="p-1.5 rounded-full text-[#6e6f77] hover:text-white transition-colors"
                    title="More Options"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => handleEpisodePlay(e, episode)}
                    className="w-8 h-8 rounded-full bg-[#f5a623] hover:bg-[#ffb13b] text-black flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95"
                    aria-label={isPlayingThis ? "Pause" : "Play"}
                  >
                    {isPlayingThis ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
