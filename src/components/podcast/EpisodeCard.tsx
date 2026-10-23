"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Pause, Heart, Clock, Radio, Sparkles, BookOpen } from "lucide-react";
import { Episode } from "@/types";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { useAuth } from "@/context/AuthContext";
import { formatTime, formatDate, cn } from "@/lib/utils";
import { AudioVisualizer } from "@/components/audio/AudioVisualizer";

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

  const { currentUser, openAuthModal } = useAuth();

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
    if (!currentUser) {
      openAuthModal({
        title: "Save to Your Library",
        description: `Create a free listener account or sign in to save "${episode.title}" and access it anytime across devices.`,
        pendingAction: {
          type: "save_episode",
          episodeId: episode.id,
          episodeTitle: episode.title,
        },
      });
      return;
    }
    toggleSaveEpisode(episode.id);
  };

  if (variant === "horizontal") {
    return (
      <div className="group relative flex items-center gap-4 p-3.5 rounded-2xl bg-[#121113]/90 hover:bg-[#1a191c] border border-[#222125] hover:border-[#ff4500]/40 transition-all duration-300 shadow-lg">
        {/* Artwork */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-[#2a2929] bg-[#161517]">
          <Image
            src={episode.artworkUrl}
            alt={episode.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Active Audio Visualizer overlay when currently playing */}
          {isPlayingCurrent && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
              <AudioVisualizer variant="mini" />
            </div>
          )}

          {/* Overlay Play Button */}
          <button
            onClick={handlePlayClick}
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={isPlayingCurrent ? "Pause" : "Play"}
          >
            <div className="p-2.5 rounded-full bg-[#ff4500] text-black shadow-[0_0_15px_rgba(255,69,0,0.8)]">
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
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#ffb13b]">
              {episode.seriesTitle}
            </span>
            {episode.scriptureReferences?.[0] && (
              <span className="font-cinzel text-[10px] text-[#a5a6af] font-semibold truncate hidden sm:inline">
                • {episode.scriptureReferences[0]}
              </span>
            )}
          </div>
          <Link
            href={`/episodes/${episode.slug}`}
            className="block font-heading text-sm font-semibold text-white group-hover:text-[#ff4500] transition-colors truncate mt-0.5"
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
            <span className="hidden md:inline">• 48kHz FLAC</span>
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
    <div className="group relative flex flex-col p-3.5 rounded-2xl bg-[#111013]/90 hover:bg-[#1a181c] border border-[#222025] hover:border-[#ff4500]/40 transition-all duration-300 hover:-translate-y-1 shadow-xl">
      {/* Artwork container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 border border-[#26242a] bg-[#161418]">
        <Image
          src={episode.artworkUrl}
          alt={episode.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Active Audio Visualizer overlay when currently playing */}
        {isPlayingCurrent && (
          <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#ff4500]/40 flex items-center gap-1.5 shadow-lg">
            <AudioVisualizer variant="mini" />
            <span className="text-[9px] font-mono text-[#ffb13b] uppercase">Live</span>
          </div>
        )}

        {/* Technical Audio Bitrate Badge */}
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[9px] font-mono text-[#a5a6af] border border-[#2f2e34]">
          48kHz
        </div>

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
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#ffb13b] truncate">
              {episode.seriesTitle}
            </span>
            {episode.scriptureReferences?.[0] && (
              <span className="font-cinzel text-[10px] text-[#a5a6af] font-semibold truncate shrink-0">
                {episode.scriptureReferences[0]}
              </span>
            )}
          </div>

          <Link
            href={`/episodes/${episode.slug}`}
            className="block font-heading text-sm font-semibold text-white group-hover:text-[#ffb13b] transition-colors line-clamp-1"
          >
            {episode.title}
          </Link>
          <p className="text-xs text-[#a5a6af] line-clamp-2 mt-1 font-body leading-relaxed">
            {episode.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#222025] text-[11px] font-mono text-[#6e6f77]">
          <span className="tabular-nums">{formatTime(episode.durationSeconds)}</span>
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
