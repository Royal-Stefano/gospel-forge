"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Heart,
  ListMusic,
  Maximize2,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Sliders,
  ChevronDown,
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
    skipBackward,
    skipForward,
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

  // Never render audio player inside Gospel Forge Studio
  if (pathname?.startsWith("/studio") || !currentEpisode) return null;

  const isSaved = isEpisodeSaved(currentEpisode.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const nextSpeed = () => {
    const rates = [0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  };

  return (
    <>
      {/* DESKTOP PLAYER DOCK (88px) */}
      <div className="fixed bottom-0 left-0 right-0 h-[88px] bg-[#0c0b0c] border-t border-[#222123] px-4 md:px-6 z-40 flex items-center justify-between select-none shadow-[0_-10px_25px_rgba(0,0,0,0.7)]">
        {/* LEFT: Artwork & Meta */}
        <div className="flex items-center gap-3.5 w-[250px] shrink-0 min-w-0">
          <Link
            href={`/episodes/${currentEpisode.slug}`}
            className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-[#2a2929] group shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          >
            <Image
              src={currentEpisode.artworkUrl}
              alt={currentEpisode.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
          <div className="flex flex-col min-w-0 overflow-hidden">
            <Link
              href={`/episodes/${currentEpisode.slug}`}
              className="text-sm font-semibold text-white hover:text-[#ffb13b] transition-colors truncate"
              title={currentEpisode.title}
            >
              {currentEpisode.title}
            </Link>
            <Link
              href={`/series/${currentEpisode.seriesId}`}
              className="text-xs text-[#a5a6af] hover:text-white transition-colors truncate"
            >
              {currentEpisode.seriesTitle}
            </Link>
          </div>
          <button
            onClick={() => {
              if (!currentUser) {
                openAuthModal({
                  title: "Save to Your Library",
                  description: `Sign in or create a free account to bookmark "${currentEpisode.title}" and sync it across devices.`,
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
              "p-1.5 rounded-full hover:bg-[#1c1b1b] transition-colors ml-1",
              isSaved ? "text-[#ff4500]" : "text-[#6e6f77] hover:text-white"
            )}
            title={isSaved ? "Remove from Saved" : "Save Episode"}
          >
            <Heart className={cn("w-4 h-4", isSaved && "fill-[#ff4500]")} />
          </button>
        </div>

        {/* CENTER: Main Controls & Scrubber */}
        <div className="flex-1 max-w-2xl px-4 flex flex-col items-center justify-center gap-1.5">
          {/* Top buttons row */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={cn(
                "p-1.5 rounded-full hover:bg-[#1c1b1b] transition-colors",
                isShuffle ? "text-[#ff4500]" : "text-[#a5a6af] hover:text-white"
              )}
              title="Shuffle"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => skipBackward(15)}
              className="p-1.5 rounded-full text-[#a5a6af] hover:text-white hover:bg-[#1c1b1b] transition-colors relative"
              title="Rewind 15 seconds"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="absolute -bottom-1 -right-1 text-[8px] font-mono text-[#a5a6af]">
                15
              </span>
            </button>

            <button
              onClick={playPrevious}
              className="p-1.5 text-[#a5a6af] hover:text-white hover:bg-[#1c1b1b] rounded-full transition-colors hidden sm:block"
              title="Previous Episode"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Molten Play/Pause Button with Glow */}
            <button
              onClick={togglePlay}
              className="relative p-3 rounded-full bg-gradient-to-tr from-[#ff4500] to-[#ffb13b] text-[#080706] shadow-[0_0_20px_rgba(255,69,0,0.6)] hover:scale-105 active:scale-95 transition-all duration-200"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={playNext}
              className="p-1.5 text-[#a5a6af] hover:text-white hover:bg-[#1c1b1b] rounded-full transition-colors hidden sm:block"
              title="Next Episode"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={() => skipForward(30)}
              className="p-1.5 rounded-full text-[#a5a6af] hover:text-white hover:bg-[#1c1b1b] transition-colors relative"
              title="Forward 30 seconds"
            >
              <RotateCw className="w-4 h-4" />
              <span className="absolute -bottom-1 -right-1 text-[8px] font-mono text-[#a5a6af]">
                30
              </span>
            </button>

            <button
              onClick={() => setIsRepeat(!isRepeat)}
              className={cn(
                "p-1.5 rounded-full hover:bg-[#1c1b1b] transition-colors",
                isRepeat ? "text-[#ff4500]" : "text-[#a5a6af] hover:text-white"
              )}
              title="Repeat"
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scrubber row */}
          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] font-mono text-[#a5a6af] w-10 text-right">
              {formatTime(currentTime)}
            </span>

            <div className="relative flex-1 flex items-center h-4 group">
              {/* Custom Track Background */}
              <div className="w-full h-1 bg-[#222123] rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-[#8f1609] via-[#ff4500] to-[#ffb13b] rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                className="absolute inset-0 w-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
              />
            </div>

            <span className="text-[11px] font-mono text-[#a5a6af] w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* RIGHT: Speed, Queue, Volume, Expand */}
        <div className="hidden lg:flex items-center justify-end gap-3 w-[250px] shrink-0">
          <button
            onClick={nextSpeed}
            className="px-2 py-1 text-xs font-mono font-medium rounded-md bg-[#181718] hover:bg-[#222123] text-[#a5a6af] hover:text-white transition-colors border border-[#2a2929]"
            title="Playback Speed"
          >
            {playbackRate}x
          </button>

          <button
            onClick={toggleQueue}
            className={cn(
              "p-2 rounded-full hover:bg-[#1c1b1b] transition-colors relative",
              isQueueOpen ? "text-[#ff4500]" : "text-[#a5a6af] hover:text-white"
            )}
            title="Queue"
          >
            <ListMusic className="w-4 h-4" />
            {queue.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#ff4500]" />
            )}
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-1.5 text-[#a5a6af] hover:text-white transition-colors"
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
              className="w-20 h-1 bg-[#222123] rounded-full accent-[#ff4500] cursor-pointer"
            />
          </div>

          <button
            onClick={() => toggleNowPlayingExpanded()}
            className="p-2 text-[#a5a6af] hover:text-white hover:bg-[#1c1b1b] rounded-full transition-colors ml-1"
            title="Full Screen Player"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* QUEUE DRAWER (SLIDE OVER) */}
      {isQueueOpen && (
        <div className="fixed bottom-[88px] right-4 w-80 max-h-96 bg-[#121113] border border-[#2a2929] rounded-xl shadow-2xl p-4 z-40 overflow-y-auto animate-in slide-in-from-bottom-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#222123] mb-3">
            <span className="font-semibold text-sm text-white font-mono">
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
            <p className="text-xs text-[#6e6f77] py-6 text-center">
              Queue is empty. Add episodes from browse or series.
            </p>
          ) : (
            <div className="space-y-2">
              {queue.map((ep, idx) => (
                <div
                  key={ep.id + idx}
                  className="flex items-center gap-3 p-2 rounded-lg bg-[#181719] hover:bg-[#201f22] transition-colors group cursor-pointer"
                  onClick={() => playEpisode(ep)}
                >
                  <div className="relative w-10 h-10 rounded overflow-hidden shrink-0">
                    <Image
                      src={ep.artworkUrl}
                      alt={ep.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate group-hover:text-[#ffb13b]">
                      {ep.title}
                    </p>
                    <p className="text-[10px] text-[#a5a6af] truncate">
                      {ep.seriesTitle}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-[#6e6f77]">
                    {formatTime(ep.durationSeconds)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FULL-SCREEN NOW PLAYING MODAL (MOBILE & EXPANDED TARGET) */}
      {isNowPlayingExpanded && (
        <div className="fixed inset-0 bg-[#080706]/98 backdrop-blur-2xl z-50 flex flex-col p-6 animate-in fade-in slide-in-from-bottom-8 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#222123]">
            <button
              onClick={() => toggleNowPlayingExpanded(false)}
              className="p-2 rounded-full bg-[#181719] text-[#a5a6af] hover:text-white"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
            <div className="text-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff4500] font-semibold">
                Now Playing
              </span>
              <p className="text-xs text-[#a5a6af] truncate max-w-xs">
                {currentEpisode.seriesTitle}
              </p>
            </div>
            <button
              onClick={() => {
                if (!currentUser) {
                  openAuthModal({
                    title: "Save to Your Library",
                    description: `Sign in or create an account to bookmark "${currentEpisode.title}".`,
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
                "p-2 rounded-full bg-[#181719]",
                isSaved ? "text-[#ff4500]" : "text-[#a5a6af]"
              )}
            >
              <Heart className={cn("w-5 h-5", isSaved && "fill-[#ff4500]")} />
            </button>
          </div>

          {/* Large Hero Artwork */}
          <div className="flex-1 flex flex-col items-center justify-center py-8">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-2xl overflow-hidden border-2 border-[#ff4500]/30 shadow-[0_0_50px_rgba(255,69,0,0.3)]">
              <Image
                src={currentEpisode.artworkUrl}
                alt={currentEpisode.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="mt-8 text-center max-w-md px-4">
              <h2 className="text-2xl font-bold font-heading text-white">
                {currentEpisode.title}
              </h2>
              <p className="text-sm text-[#ffb13b] font-medium mt-1">
                {currentEpisode.seriesTitle}
              </p>
              <p className="text-xs text-[#a5a6af] mt-1 font-body">
                Hosted by {currentEpisode.speaker.name}
              </p>
            </div>
          </div>

          {/* Controls Container */}
          <div className="max-w-md w-full mx-auto space-y-6 pb-6">
            {/* Scrubber */}
            <div>
              <div className="relative flex items-center h-6 group">
                <div className="w-full h-1.5 bg-[#222123] rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-[#8f1609] via-[#ff4500] to-[#ffb13b] rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-xs font-mono text-[#a5a6af] px-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Playback Buttons */}
            <div className="flex items-center justify-between px-4">
              <button
                onClick={() => skipBackward(15)}
                className="p-3 rounded-full bg-[#181719] text-[#a5a6af] hover:text-white"
              >
                <RotateCcw className="w-6 h-6" />
              </button>

              <button
                onClick={togglePlay}
                className="p-5 rounded-full bg-gradient-to-tr from-[#ff4500] to-[#ffb13b] text-[#080706] shadow-[0_0_30px_rgba(255,69,0,0.7)]"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 fill-current" />
                ) : (
                  <Play className="w-8 h-8 fill-current ml-1" />
                )}
              </button>

              <button
                onClick={() => skipForward(30)}
                className="p-3 rounded-full bg-[#181719] text-[#a5a6af] hover:text-white"
              >
                <RotateCw className="w-6 h-6" />
              </button>
            </div>

            {/* Bottom Row: Speed & Volume */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={nextSpeed}
                className="px-3 py-1.5 text-xs font-mono rounded-lg bg-[#181719] text-[#ffb13b] border border-[#2a2929]"
              >
                {playbackRate}x Speed
              </button>
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#a5a6af]" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-24 h-1 accent-[#ff4500]"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
