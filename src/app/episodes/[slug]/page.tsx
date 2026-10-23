"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Play,
  Pause,
  Plus,
  Share2,
  MoreHorizontal,
  RotateCcw,
  RotateCw,
  Shuffle,
  Repeat,
  Volume2,
  Maximize2,
  BookOpen,
  Crown,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { usePodcastStore } from "@/context/PodcastStoreContext";
import { useAuth } from "@/context/AuthContext";
import { formatTime, cn } from "@/lib/utils";
import { AudioVisualizer } from "@/components/audio/AudioVisualizer";
import { EPISODES } from "@/data/mockData";

export default function EpisodeDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { currentUser, openAuthModal } = useAuth();
  const { getEpisodeBySlug, getPublishedEpisodes } = usePodcastStore();
  const publishedEpisodes = getPublishedEpisodes();
  const episode = getEpisodeBySlug(slug) || publishedEpisodes[0] || EPISODES[0];

  const {
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    playEpisode,
    togglePlay,
    seek,
    skipBackward,
    skipForward,
    playbackRate,
    setPlaybackRate,
    volume,
    setVolume,
    toggleSaveEpisode,
    isEpisodeSaved,
  } = useAudioPlayer();

  const [activeTab, setActiveTab] = useState<
    "about" | "notes" | "scripture" | "transcript" | "community"
  >("about");
  const [autoplay, setAutoplay] = useState(true);

  const isCurrent = currentEpisode?.id === episode.id;
  const isPlayingCurrent = isCurrent && isPlaying;
  const isSaved = isEpisodeSaved(episode.id);

  // Up Next episodes (episodes 2 to 5)
  const upNextEpisodes = EPISODES.filter((ep) => ep.id !== episode.id).slice(0, 4);

  // Related episodes (episodes 7 to 10)
  const relatedEpisodes = EPISODES.slice(6, 10);

  const handlePlayToggle = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playEpisode(episode);
    }
  };

  const handleSave = () => {
    if (!currentUser) {
      openAuthModal({
        title: "Save Episode",
        description: `Create an account to save "${episode.title}" and access it anytime across devices.`,
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

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="px-4 md:px-8 py-6 space-y-8 pb-16">
      {/* 1. BREADCRUMB */}
      <nav className="flex items-center gap-2 text-xs font-sans text-[#a5a6af]">
        <Link href="/browse" className="hover:text-white transition-colors">
          Episodes
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#6e6f77]" />
        <Link href="/series" className="hover:text-white transition-colors">
          {episode.seriesTitle}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#6e6f77]" />
        <span className="text-white font-medium truncate">{episode.title}</span>
      </nav>

      {/* 2. HERO EPISODE OVERVIEW */}
      <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
        {/* Large Square Artwork */}
        <div className="relative aspect-square w-full sm:w-64 md:w-72 rounded-2xl overflow-hidden shrink-0 border border-[#2a292f] bg-[#141316] shadow-2xl">
          <Image
            src={episode.artworkUrl}
            alt={episode.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Episode Metadata & Actions */}
        <div className="flex-1 min-w-0 space-y-3.5">
          <p className="font-mono text-xs text-[#ff4500] font-bold uppercase tracking-wider">
            {episode.seriesTitle}
          </p>

          <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {episode.title}
          </h1>

          <p className="text-xs text-[#a5a6af] font-mono">
            Season {episode.seasonNumber || 1} • Episode {episode.episodeNumber || 3} •{" "}
            {episode.publishedAt.slice(0, 10)} • {Math.round(episode.durationSeconds / 60)} min
          </p>

          <p className="text-xs sm:text-sm text-[#d0cfd6] font-body leading-relaxed max-w-2xl">
            {episode.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handlePlayToggle}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#ff4500] to-[#e63900] text-white font-heading font-bold text-xs sm:text-sm tracking-wide hover:shadow-[0_0_20px_rgba(255,69,0,0.6)] hover:scale-105 active:scale-95 transition-all"
            >
              {isPlayingCurrent ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Episode</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Play Episode</span>
                </>
              )}
            </button>

            <button
              onClick={handleSave}
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border text-xs font-semibold transition-all",
                isSaved
                  ? "bg-[#ff4500]/20 text-[#ffb13b] border-[#ff4500]/50"
                  : "bg-[#141316] text-white border-[#28272b] hover:border-white/40"
              )}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSaved ? "Saved" : "Save"}</span>
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: episode.title,
                    url: window.location.href,
                  });
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#141316] text-white border border-[#28272b] hover:border-white/40 text-xs font-semibold transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            <button
              className="p-2.5 rounded-full bg-[#141316] text-[#a5a6af] hover:text-white border border-[#28272b] transition-all"
              title="More Options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE AUDIO WAVEFORM PLAYER BAR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#111013] border border-[#222125] shadow-xl space-y-3">
        {/* Scrubber row with waveform */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-[#a5a6af] w-10 text-right tabular-nums">
            {formatTime(currentTime)}
          </span>

          <div className="relative flex-1 flex items-center h-8 group">
            {/* Visualizer Waveform Bar */}
            <div className="w-full flex items-center gap-1 h-6 px-1">
              {Array.from({ length: 60 }).map((_, i) => {
                const barPercent = (i / 60) * 100;
                const isPassed = barPercent <= progressPercent;
                const heightPercent = 20 + Math.sin(i * 0.4) * 35 + ((i % 5) * 8);

                return (
                  <div
                    key={i}
                    style={{ height: `${heightPercent}%` }}
                    className={cn(
                      "flex-1 rounded-full transition-all duration-150",
                      isPassed
                        ? "bg-gradient-to-t from-[#ff4500] to-[#ffb13b]"
                        : "bg-[#252429]"
                    )}
                  />
                );
              })}
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

          <span className="text-[11px] font-mono text-[#a5a6af] w-10 tabular-nums">
            {formatTime(duration || episode.durationSeconds)}
          </span>
        </div>

        {/* Controls row matching design */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => {}}
              className="p-1.5 text-[#6e6f77] hover:text-white transition-colors"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={() => skipBackward(10)}
              className="p-1.5 text-[#a5a6af] hover:text-white transition-colors flex items-center gap-1 text-[10px] font-mono"
            >
              <RotateCcw className="w-4 h-4" />
              <span>10</span>
            </button>

            <button
              onClick={handlePlayToggle}
              className="p-3 rounded-full bg-gradient-to-r from-[#ff4500] to-[#e63900] text-white shadow-[0_0_15px_rgba(255,69,0,0.6)] hover:scale-105 active:scale-95 transition-all"
            >
              {isPlayingCurrent ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={() => skipForward(10)}
              className="p-1.5 text-[#a5a6af] hover:text-white transition-colors flex items-center gap-1 text-[10px] font-mono"
            >
              <RotateCw className="w-4 h-4" />
              <span>10</span>
            </button>

            <button
              onClick={() => {}}
              className="p-1.5 text-[#6e6f77] hover:text-white transition-colors"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const speeds = [1, 1.25, 1.5, 2];
                const next = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
                setPlaybackRate(next);
              }}
              className="px-2 py-0.5 rounded text-xs font-mono text-[#a5a6af] hover:text-white bg-[#1a191c] border border-[#262429]"
            >
              {playbackRate}x
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#a5a6af]" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-16 h-1 accent-[#ff4500] cursor-pointer"
              />
            </div>

            <button
              onClick={() => {}}
              className="p-1.5 text-[#6e6f77] hover:text-white transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. TABS NAVIGATION */}
      <div className="border-b border-[#222125]">
        <div className="flex items-center gap-6 text-xs sm:text-sm font-semibold">
          {[
            { id: "about", label: "About" },
            { id: "notes", label: "Show Notes" },
            { id: "scripture", label: "Scripture References" },
            { id: "transcript", label: "Transcript" },
            { id: "community", label: "Community (128)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "pb-3.5 transition-colors relative",
                activeTab === tab.id
                  ? "text-white font-bold"
                  : "text-[#6e6f77] hover:text-[#a5a6af]"
              )}
            >
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff4500] shadow-[0_0_8px_#ff4500]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 5. MAIN CONTENT TWO-COLUMN SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Details & Key Scripture) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-3">
            <h3 className="font-heading text-lg font-bold text-white tracking-tight">
              About This Episode
            </h3>
            <p className="text-xs sm:text-sm text-[#a5a6af] font-body leading-relaxed">
              Life&apos;s toughest seasons often feel like delays, but they are divine preparation. In this episode, we explore how God uses the waiting, the refining, and the unknown to shape a greater purpose in our lives.
            </p>
            <p className="text-xs sm:text-sm text-[#a5a6af] font-body leading-relaxed">
              Through Scripture, personal stories, and practical insights, we&apos;ll discover how to trust God in the process, stay faithful when the path is unclear, and embrace the growth that comes through every season.
            </p>
          </div>

          {/* Key Scripture References Callout Box */}
          <div className="space-y-3">
            <h4 className="font-heading text-sm font-bold text-white tracking-wide">
              Key Scripture References
            </h4>
            <div className="p-4 sm:p-5 rounded-2xl bg-[#141215] border-l-4 border-[#ff4500] border-y border-r border-[#262429] flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-[#ffb13b]/10 text-[#ffb13b] shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <blockquote className="font-cinzel text-xs sm:text-sm text-[#f5f0ea] leading-relaxed italic">
                  &ldquo;And we know that in all things God works for the good of those who love Him, who have been called according to His purpose.&rdquo;
                </blockquote>
                <p className="font-mono text-[11px] text-[#ffb13b] font-bold">
                  Romans 8:28 (NIV)
                </p>
              </div>
            </div>
          </div>

          {/* Technical Metadata Details Grid */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#111013] border border-[#222125] grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#6e6f77] block text-[11px]">Series</span>
              <span className="text-white font-medium">{episode.seriesTitle}</span>
            </div>
            <div>
              <span className="text-[#6e6f77] block text-[11px]">Speaker</span>
              <span className="text-white font-medium">{episode.speaker.name}</span>
            </div>
            <div>
              <span className="text-[#6e6f77] block text-[11px]">Category</span>
              <span className="text-white font-medium">{episode.category}</span>
            </div>
            <div>
              <span className="text-[#6e6f77] block text-[11px]">Topics</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {episode.topics.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md bg-[#18171b] text-[#a5a6af] text-[10px] border border-[#26242a]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[#6e6f77] block text-[11px]">Language</span>
              <span className="text-white font-medium">English</span>
            </div>
            <div>
              <span className="text-[#6e6f77] block text-[11px]">Explicit Content</span>
              <span className="text-white font-medium">No</span>
            </div>
          </div>
        </div>

        {/* Right Column (Up Next, Related Episodes, Unlock More CTA) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Up Next Box */}
          <div className="p-4 rounded-2xl bg-[#111013] border border-[#222125] shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-heading text-sm font-bold text-white tracking-wide">
                Up Next
              </h4>
              <div className="flex items-center gap-2 text-[11px] text-[#a5a6af]">
                <span>Autoplay</span>
                <button
                  onClick={() => setAutoplay(!autoplay)}
                  className={cn(
                    "w-8 h-4 rounded-full transition-colors relative",
                    autoplay ? "bg-[#ff4500]" : "bg-[#28272c]"
                  )}
                >
                  <span
                    className={cn(
                      "w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform",
                      autoplay ? "right-0.5" : "left-0.5"
                    )}
                  />
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {upNextEpisodes.map((ep, idx) => (
                <div
                  key={ep.id}
                  className="flex items-center gap-3 p-2 rounded-xl bg-[#151417] hover:bg-[#1c1b1f] border border-[#201f23] transition-all group cursor-pointer"
                  onClick={() => playEpisode(ep)}
                >
                  <span className="font-mono text-xs text-[#6e6f77] w-3 text-center">
                    {idx + 1}
                  </span>
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[#2a292f]">
                    <Image
                      src={ep.artworkUrl}
                      alt={ep.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-xs font-bold text-white group-hover:text-[#ffb13b] transition-colors truncate">
                      {ep.title}
                    </p>
                    <p className="text-[10px] text-[#6e6f77] truncate">
                      {ep.seriesTitle} • {Math.round(ep.durationSeconds / 60)} min
                    </p>
                  </div>
                  <button
                    className="w-6 h-6 rounded-full bg-[#f5a623] hover:bg-[#ffb13b] text-black flex items-center justify-center shrink-0 shadow-sm"
                    aria-label={`Play ${ep.title}`}
                  >
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Related Episodes Box */}
          <div className="p-4 rounded-2xl bg-[#111013] border border-[#222125] shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-heading text-sm font-bold text-white tracking-wide">
                Related Episodes
              </h4>
              <Link
                href="/browse"
                className="text-xs text-[#a5a6af] hover:text-[#ffb13b] flex items-center gap-1 font-sans transition-colors"
              >
                See all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {relatedEpisodes.map((ep) => (
                <div
                  key={ep.id}
                  className="flex items-center gap-3 p-2 rounded-xl bg-[#151417] hover:bg-[#1c1b1f] border border-[#201f23] transition-all group cursor-pointer"
                  onClick={() => playEpisode(ep)}
                >
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[#2a292f]">
                    <Image
                      src={ep.artworkUrl}
                      alt={ep.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-xs font-bold text-white group-hover:text-[#ffb13b] transition-colors truncate">
                      {ep.title}
                    </p>
                    <p className="text-[10px] text-[#6e6f77] truncate">
                      {ep.seriesTitle}
                    </p>
                  </div>
                  <button
                    className="w-6 h-6 rounded-full bg-[#f5a623] hover:bg-[#ffb13b] text-black flex items-center justify-center shrink-0 shadow-sm"
                    aria-label={`Play ${ep.title}`}
                  >
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Unlock More Callout Card with Volcanic Mountain Background */}
          {!currentUser && (
            <div className="relative overflow-hidden p-6 rounded-3xl border border-[#ff4500]/30 shadow-2xl text-center space-y-3">
              <div className="absolute inset-0 opacity-40 pointer-events-none">
                <Image
                  src="/images/hero-volcanic-cross.jpg"
                  alt="Background"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[#080706]/75" />
              </div>

              <div className="relative z-10 space-y-2">
                <div className="flex justify-center">
                  <div className="p-2 rounded-full bg-[#ffb13b]/20 text-[#ffb13b]">
                    <Crown className="w-4 h-4 fill-current" />
                  </div>
                </div>
                <h4 className="font-heading text-sm font-bold text-white">
                  Save Episodes. Build Playlists.
                </h4>
                <p className="text-[11px] text-[#d0cfd6]">
                  Join the Conversation.
                </p>
                <button
                  onClick={() =>
                    openAuthModal({
                      title: "Create a Free Account",
                      description:
                        "Unlock full library bookmarking, custom playlist generation, and community discussions.",
                    })
                  }
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#ff4500] to-[#e63900] text-white font-heading font-bold text-xs tracking-wide hover:shadow-[0_0_20px_rgba(255,69,0,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Create a Free Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
