"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Pause, Heart, Clock } from "lucide-react";
import { Episode } from "@/types";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { formatTime, formatDate, cn } from "@/lib/utils";

interface EpisodeCardProps {
  episode: Episode;
  variant?: "horizontal" | "vertical" | "compact";
}

export function EpisodeCard({ episode, variant = "vertical" }: EpisodeCardProps) {
  const {
    currentEpisode,
    isPlaying,
    playEpisode,
    togglePlay,
    toggleSaveEpisode,
    isEpisodeSaved,
  } = useAudioPlayer();

  const isCurrent = currentEpisode?.id === episode.id;
  const isPlayingCurrent = isCurrent && isPlaying;
  const isSaved = isEpisodeSaved(episode.id);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playEpisode(episode);
    }
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaveEpisode(episode.id);
  };

  if (variant === "horizontal") {
    return (
      <div className="group relative flex items-center gap-4 p-3 rounded-xl bg-[#141314]/80 hover:bg-[#1c1b1b] border border-[#222123] hover:border-[#ff4500]/40 transition-all duration-300 shadow-lg">
        {/* Artwork */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 border border-[#2a2929]">
          <Image
            src={episode.artworkUrl}
            alt={episode.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Overlay Play Button */}
          <button
            onClick={handlePlayClick}
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="p-2 rounded-full bg-[#ff4500] text-black shadow-[0_0_12px_rgba(255,69,0,0.8)]">
              {isPlayingCurrent ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </div>
          </button>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#ffb13b]">
            {episode.seriesTitle}
          </span>
          <Link
            href={`/episodes/${episode.slug}`}
            className="block text-sm font-semibold text-white group-hover:text-[#ff4500] transition-colors truncate"
          >
            {episode.title}
          </Link>
          <p className="text-xs text-[#a5a6af] line-clamp-1 mt-0.5 font-body">
            {episode.description}
          </p>
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#6e6f77] font-mono">
            <span>{formatDate(episode.publishedAt)}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(episode.durationSeconds)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveClick}
            className={cn(
              "p-2 rounded-full hover:bg-[#252426] transition-colors",
              isSaved ? "text-[#ff4500]" : "text-[#6e6f77] hover:text-white"
            )}
            title={isSaved ? "Remove from Saved" : "Save Episode"}
          >
            <Heart className={cn("w-4 h-4", isSaved && "fill-[#ff4500]")} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex flex-col p-3 rounded-2xl bg-[#111113]/90 hover:bg-[#1a191b] border border-[#222123] hover:border-[#ff4500]/40 transition-all duration-300 hover:-translate-y-1 shadow-xl">
      {/* Artwork container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 border border-[#262527] bg-[#161517]">
        <Image
          src={episode.artworkUrl}
          alt={episode.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Play button floating badge on hover */}
        <button
          onClick={handlePlayClick}
          className={cn(
            "absolute bottom-3 right-3 p-3 rounded-full bg-gradient-to-tr from-[#ff4500] to-[#ffb13b] text-black shadow-[0_0_20px_rgba(255,69,0,0.8)] transition-all duration-300 transform",
            isPlayingCurrent
              ? "opacity-100 scale-100"
              : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
          )}
          aria-label={isPlayingCurrent ? "Pause" : "Play episode"}
        >
          {isPlayingCurrent ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>
      </div>

      {/* Meta */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#ffb13b]">
            {episode.seriesTitle}
          </span>
          <Link
            href={`/episodes/${episode.slug}`}
            className="block text-sm font-semibold text-white group-hover:text-[#ffb13b] transition-colors line-clamp-1 mt-0.5"
          >
            {episode.title}
          </Link>
          <p className="text-xs text-[#a5a6af] line-clamp-2 mt-1 font-body">
            {episode.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#222123]/70 text-[11px] font-mono text-[#6e6f77]">
          <span>{formatTime(episode.durationSeconds)}</span>
          <button
            onClick={handleSaveClick}
            className={cn(
              "p-1 rounded-full hover:bg-[#252426] transition-colors",
              isSaved ? "text-[#ff4500]" : "text-[#6e6f77] hover:text-white"
            )}
          >
            <Heart className={cn("w-3.5 h-3.5", isSaved && "fill-[#ff4500]")} />
          </button>
        </div>
      </div>
    </div>
  );
}
