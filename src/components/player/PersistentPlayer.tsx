"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Heart,
  Volume2,
  VolumeX,
  ListMusic,
  Maximize2,
  ChevronDown,
  Radio,
} from "lucide-react";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { useAuth } from "@/context/AuthContext";
import { formatTime, cn } from "@/lib/utils";

export function PersistentPlayer() {
  const { currentUser, openAuthModal } = useAuth();
  const {
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    queue,
    isQueueOpen,
    isNowPlayingExpanded,
    playEpisode,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
    toggleQueue,
    toggleNowPlayingExpanded,
    toggleSaveEpisode,
    isEpisodeSaved,
    playNext,
    playPrevious,
  } = useAudioPlayer();

  const pathname = usePathname();
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  // Suppress player inside Gospel Forge Studio or full-screen Auth pages
  if (
    pathname?.startsWith("/studio") ||
    pathname === "/signup" ||
    pathname === "/login" ||
    !currentEpisode
  )
    return null;

  const isSaved = isEpisodeSaved(currentEpisode.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const nextSpeed = () => {
    const rates = [1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  };

  return (
    <>
      {/* DESKTOP & MOBILE PERSISTENT PLAYER DOCK (88px) */}
      <div className="fixed bottom-0 left-0 right-0 h-[84px] bg-[#0c0b0d]/95 backdrop-blur-2xl border-t border-[#1f1e21] px-4 md:px-8 z-40 flex items-center justify-between select-none shadow-[0_-12px_35px_rgba(0,0,0,0.8)]">
        {/* LEFT: Artwork, Title, Series, Heart */}
        <div className="flex items-center gap-3.5 w-[220px] sm:w-[260px] shrink-0 min-w-0">
          <Link
            href={`/episodes/${currentEpisode.slug}`}
            className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 border border-[#2a292f] bg-[#161418] shadow-md group"
          >
            <Image
              src={currentEpisode.artworkUrl}
              alt={currentEpisode.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          </Link>

          <div className="flex flex-col min-w-0 overflow-hidden">
            <Link
              href={`/episodes/${currentEpisode.slug}`}
              className="font-heading text-xs sm:text-sm font-bold text-white hover:text-[#ffb13b] transition-colors truncate"
              title={currentEpisode.title}
            >
              {currentEpisode.title}
            </Link>
            <Link
              href={`/series/${currentEpisode.seriesId}`}
              className="text-[11px] text-[#a5a6af] hover:text-white transition-colors truncate mt-0.5"
            >
              {currentEpisode.seriesTitle}
            </Link>
          </div>

          <button
            onClick={() => {
              if (!currentUser) {
                openAuthModal({
                  title: "Save Episode",
                  description: `Bookmark "${currentEpisode.title}" into your personal library.`,
                  pendingAction: {
                    type: "save_episode",
                    episodeId: currentEpisode.id,
                    episodeTitle: currentEpisode.title,
                  },
                });
                return;
              }
              toggleSaveEpisode(currentEpisode.id);
            }}
            className={cn(
              "p-1.5 rounded-full hover:bg-[#1c1b1f] transition-colors ml-1 shrink-0",
              isSaved ? "text-[#ff4500]" : "text-[#6e6f77] hover:text-white"
            )}
            title={isSaved ? "Remove from Saved" : "Save Episode"}
          >
            <Heart className={cn("w-4 h-4", isSaved && "fill-[#ff4500]")} />
          </button>
        </div>

        {/* CENTER: Main Controls & Scrubber (Matching reference image) */}
        <div className="flex-1 max-w-2xl px-2 sm:px-6 flex flex-col items-center justify-center gap-1.5">
          {/* Top buttons row */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={cn(
                "p-1 text-[#6e6f77] hover:text-white transition-colors",
                isShuffle && "text-[#ff4500]"
              )}
              title="Shuffle"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={playPrevious}
              className="p-1 text-[#a5a6af] hover:text-white transition-colors"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            {/* Red / Orange Circular Glowing Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="relative p-2.5 sm:p-3 rounded-full bg-gradient-to-r from-[#ff4500] to-[#e63900] text-white shadow-[0_0_20px_rgba(255,69,0,0.6)] hover:scale-105 active:scale-95 transition-all duration-200"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={playNext}
              className="p-1 text-[#a5a6af] hover:text-white transition-colors"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={() => setIsRepeat(!isRepeat)}
              className={cn(
                "p-1 text-[#6e6f77] hover:text-white transition-colors",
                isRepeat && "text-[#ff4500]"
              )}
              title="Repeat"
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scrubber row with elapsed, golden line & duration */}
          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] font-mono text-[#a5a6af] w-10 text-right tabular-nums">
              {formatTime(currentTime)}
            </span>

            <div className="relative flex-1 flex items-center h-4 group">
              {/* Custom Track Background */}
              <div className="w-full h-1 bg-[#222125] rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-[#ff4500] via-[#ffb13b] to-[#f5a623] rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Scrubber Knob */}
              <div
                className="absolute w-3 h-3 rounded-full bg-[#f5a623] shadow-[0_0_8px_#ff4500] -translate-x-1/2 pointer-events-none transition-transform group-hover:scale-125"
                style={{ left: `${progressPercent}%` }}
              />

              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
              />
            </div>

            <span className="text-[11px] font-mono text-[#a5a6af] w-10 tabular-nums">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* RIGHT: Speed, Volume, Queue, Expand */}
        <div className="hidden lg:flex items-center justify-end gap-3 w-[220px] sm:w-[260px] shrink-0">
          {/* Speed Indicator */}
          <button
            onClick={nextSpeed}
            className="text-xs font-mono font-semibold text-[#a5a6af] hover:text-white px-2 py-0.5 rounded hover:bg-[#1a191d] transition-colors"
            title="Cycle Playback Speed"
          >
            {playbackRate}x
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-1 text-[#a5a6af] hover:text-white transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-500" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-18 h-1 bg-[#222125] rounded-full accent-[#f5a623] cursor-pointer"
            />
          </div>

          {/* Queue Drawer Button */}
          <button
            onClick={toggleQueue}
            className={cn(
              "p-1.5 rounded-full hover:bg-[#1c1b1f] transition-colors relative",
              isQueueOpen ? "text-[#ff4500]" : "text-[#a5a6af] hover:text-white"
            )}
            title="Queue"
          >
            <ListMusic className="w-4 h-4" />
            {queue.length > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#ff4500]" />
            )}
          </button>

          {/* Full Screen Expand Button */}
          <button
            onClick={() => toggleNowPlayingExpanded()}
            className="p-1.5 text-[#a5a6af] hover:text-white hover:bg-[#1c1b1f] rounded-full transition-colors"
            title="Expand Player"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* QUEUE DRAWER (SLIDE OVER) */}
      {isQueueOpen && (
        <div className="fixed bottom-[84px] right-4 w-80 max-h-96 bg-[#121113] border border-[#2a292f] rounded-2xl shadow-2xl p-4 z-40 overflow-y-auto animate-in slide-in-from-bottom-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#222125] mb-3">
            <span className="font-semibold text-xs text-white font-mono flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-[#ff4500]" />
              Up Next ({queue.length})
            </span>
            <button
              onClick={toggleQueue}
              className="text-xs text-[#a5a6af] hover:text-white"
            >
              Close
            </button>
          </div>
          {queue.length === 0 ? (
            <p className="text-xs text-[#6e6f77] py-6 text-center font-mono">
              Queue is empty. Select any episode to add to queue.
            </p>
          ) : (
            <div className="space-y-2">
              {queue.map((ep, idx) => (
                <div
                  key={ep.id + idx}
                  className="flex items-center gap-3 p-2 rounded-xl bg-[#181719] hover:bg-[#201f22] transition-colors group cursor-pointer"
                  onClick={() => playEpisode(ep)}
                >
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[#262529]">
                    <Image
                      src={ep.artworkUrl}
                      alt={ep.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-xs font-medium text-white truncate group-hover:text-[#ffb13b]">
                      {ep.title}
                    </p>
                    <p className="text-[10px] text-[#a5a6af] truncate">
                      {ep.seriesTitle}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-[#6e6f77] tabular-nums">
                    {formatTime(ep.durationSeconds)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FULL-SCREEN NOW PLAYING MODAL (EXPANDED) */}
      {isNowPlayingExpanded && (
        <div className="fixed inset-0 bg-[#080706]/98 backdrop-blur-2xl z-50 flex flex-col p-6 animate-in fade-in slide-in-from-bottom-8 overflow-y-auto">
          <div className="flex items-center justify-between pb-4 border-b border-[#222125]">
            <button
              onClick={() => toggleNowPlayingExpanded(false)}
              className="p-2 rounded-full bg-[#181719] text-[#a5a6af] hover:text-white"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
            <div className="text-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff4500] font-semibold flex items-center justify-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#ff4500] animate-pulse" />
                The Forged Frequency Live
              </span>
              <p className="font-heading text-xs text-[#a5a6af] truncate max-w-xs mt-0.5">
                {currentEpisode.seriesTitle}
              </p>
            </div>
            <button
              onClick={() => toggleSaveEpisode(currentEpisode.id)}
              className={cn(
                "p-2 rounded-full bg-[#181719]",
                isSaved ? "text-[#ff4500]" : "text-[#a5a6af]"
              )}
            >
              <Heart className={cn("w-5 h-5", isSaved && "fill-[#ff4500]")} />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-6">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-3xl overflow-hidden border-2 border-[#ff4500]/40 shadow-[0_0_60px_rgba(255,69,0,0.35)] group">
              <Image
                src={currentEpisode.artworkUrl}
                alt={currentEpisode.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="text-center max-w-md px-4 space-y-1.5 mt-6">
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white">
                {currentEpisode.title}
              </h2>
              <p className="text-sm text-[#ffb13b] font-medium">
                {currentEpisode.seriesTitle}
              </p>
              <p className="text-xs text-[#a5a6af] font-body">
                Speaker: {currentEpisode.speaker.name}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
