"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Play, Layers, ChevronRight, User, Radio, Compass } from "lucide-react";
import { EpisodeCard } from "@/components/podcast/EpisodeCard";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { usePodcastStore } from "@/context/PodcastStoreContext";

export default function SeriesDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { seriesList, getPublishedEpisodes } = usePodcastStore();
  const series = seriesList.find((s) => s.slug === slug || s.id === slug);
  const publishedEpisodes = getPublishedEpisodes();
  const seriesEpisodes = series ? publishedEpisodes.filter((e) => e.seriesId === series.id) : [];
  const { playEpisode } = useAudioPlayer();

  if (!series) {
    return (
      <div className="px-4 md:px-8 py-16 text-center space-y-4 max-w-md mx-auto">
        <Radio className="w-10 h-10 text-[#ff4500] mx-auto opacity-70" />
        <h2 className="font-heading text-xl font-bold text-white">Series Not Found</h2>
        <p className="text-xs text-[#a5a6af]">
          The podcast series you are looking for does not exist or has been relocated.
        </p>
        <Link
          href="/series"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#ff4500] text-black font-heading font-bold text-xs uppercase tracking-wider hover:bg-[#e63900] transition-colors"
        >
          <Compass className="w-4 h-4" />
          <span>Browse All Series</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 space-y-8 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-mono text-[#a5a6af]">
        <Link href="/series" className="hover:text-white transition-colors">
          Series
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-white truncate">{series.title}</span>
      </nav>

      {/* Hero Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#161110] via-[#111113] to-[#080706] border border-[#ff4500]/25 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
        <div className="relative w-48 h-48 rounded-2xl overflow-hidden shrink-0 border-2 border-[#ff4500]/30 shadow-[0_0_30px_rgba(255,69,0,0.3)]">
          <Image
            src={series.artworkUrl}
            alt={series.title}
            fill
            className="object-cover"
          />
        </div>

        <div className="space-y-3 text-center md:text-left flex-1">
          <span className="px-3 py-1 rounded-full bg-[#ff4500]/15 text-[#ffb13b] text-xs font-mono border border-[#ff4500]/30 uppercase tracking-wider font-semibold">
            {series.category}
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
            {series.title}
          </h1>
          <p className="text-sm text-[#a5a6af] max-w-xl font-body">
            {series.description}
          </p>
          <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-mono text-[#6e6f77] pt-1">
            <span className="text-white font-medium">Host: {series.hostName}</span>
            <span>•</span>
            <span>{seriesEpisodes.length} Episodes available</span>
          </div>

          {seriesEpisodes.length > 0 && (
            <div className="pt-2">
              <button
                onClick={() => playEpisode(seriesEpisodes[0])}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#8f1609] to-[#ff4500] text-white font-heading font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_20px_rgba(255,69,0,0.5)] transition-all"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Play First Episode</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Episodes List */}
      <div className="space-y-4">
        <h2 className="font-heading text-xl font-bold text-white tracking-wide">
          All Episodes ({seriesEpisodes.length})
        </h2>

        {seriesEpisodes.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#121113] border border-[#222123] text-center text-xs text-[#a5a6af]">
            No published episodes for this series yet.
          </div>
        ) : (
          <div className="space-y-3">
            {seriesEpisodes.map((episode) => (
              <EpisodeCard key={episode.id} episode={episode} variant="horizontal" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
