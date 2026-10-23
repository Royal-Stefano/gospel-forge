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
  Sparkles,
} from "lucide-react";
import { CinematicHero } from "@/components/home/CinematicHero";
import { usePodcastStore } from "@/context/PodcastStoreContext";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { formatTime } from "@/lib/utils";

export default function HomePage() {
  const { currentEpisode, isPlaying, togglePlay, playEpisode } = useAudioPlayer();
  const { seriesList, getPublishedEpisodes, isLoading } = usePodcastStore();

  const publishedEpisodes = getPublishedEpisodes();
  const featuredSeries = seriesList.slice(0, 6);
  const latestEpisodes = publishedEpisodes.slice(0, 3);

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
    // Play first episode of that series if available
    const targetEpisode = publishedEpisodes.find((ep) => ep.seriesId === series.id);
    if (targetEpisode) {
      if (currentEpisode?.id === targetEpisode.id) {
        togglePlay();
      } else {
        playEpisode(targetEpisode);
      }
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

        {featuredSeries.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#121113]/80 border border-[#222125] text-center space-y-2">
            <Radio className="w-7 h-7 text-[#ff4500] mx-auto opacity-75" />
            <p className="font-heading text-sm font-semibold text-white">
              No podcast series published yet
            </p>
            <p className="text-xs text-[#a5a6af] max-w-sm mx-auto">
              New faith messages, expository series, and discussions are currently in production.
            </p>
          </div>
        ) : (
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

                    {/* Circular Yellow Play Button */}
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
                    {series.category}
                  </p>
                </div>
              );
            })}
          </div>
        )}
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

        {latestEpisodes.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#121113]/80 border border-[#222125] text-center space-y-2">
            <Flame className="w-7 h-7 text-[#ffb13b] mx-auto opacity-75" />
            <p className="font-heading text-sm font-semibold text-white">
              No episodes available yet
            </p>
            <p className="text-xs text-[#a5a6af] max-w-sm mx-auto">
              Newly published teachings and podcast episodes will appear here immediately.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {latestEpisodes.map((episode) => {
              const isPlayingThis =
                isPlaying && currentEpisode?.id === episode.id;

              return (
                <div
                  key={episode.id}
                  className="p-3.5 rounded-2xl bg-[#121113] border border-[#222125] hover:border-[#ff4500]/40 transition-all flex items-center gap-3.5 group cursor-pointer"
                  onClick={(e) => handleEpisodePlay(e, episode)}
                >
                  {/* Square Episode Artwork */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[#2a292f] bg-[#161418]">
                    <Image
                      src={episode.artworkUrl}
                      alt={episode.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />

                    {/* Small Play Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {isPlayingThis ? (
                        <Pause className="w-5 h-5 text-white fill-current" />
                      ) : (
                        <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Middle Info */}
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono text-[#ff4500] uppercase tracking-wider">
                      {episode.seriesTitle}
                    </span>
                    <h3 className="font-heading text-xs sm:text-sm font-bold text-white group-hover:text-[#ffb13b] transition-colors truncate">
                      {episode.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-[#a5a6af]">
                      <span>{formatTime(episode.durationSeconds)}</span>
                      <span>•</span>
                      <span>{episode.publishedAt ? new Date(episode.publishedAt).toLocaleDateString() : "Recent"}</span>
                    </div>
                  </div>

                  {/* Right Play Button */}
                  <button
                    onClick={(e) => handleEpisodePlay(e, episode)}
                    className="w-8 h-8 rounded-full bg-[#1b1a1e] hover:bg-[#ff4500] text-[#a5a6af] hover:text-white flex items-center justify-center shrink-0 transition-colors"
                    aria-label={`Play ${episode.title}`}
                  >
                    {isPlayingThis ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
