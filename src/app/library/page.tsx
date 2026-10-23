"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bookmark,
  ListMusic,
  History,
  Download,
  Play,
  Pause,
  ChevronRight,
  MoreHorizontal,
  Headphones,
  Clock,
  Heart,
  Flame,
  Sun,
  UserCheck,
  Music,
  BookOpen,
  Plus,
  ChevronDown,
} from "lucide-react";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { EPISODES, USER_PLAYLISTS } from "@/data/mockData";
import { formatTime } from "@/lib/utils";

const PLAYLIST_ICONS: Record<string, any> = {
  "My Favourites": Heart,
  "Daily Devotion": Sun,
  "Faith in Action": UserCheck,
  "Worship & Praise": Music,
  "Biblical Teachings": BookOpen,
};

const ALL_PLAYLISTS = [
  { id: "p1", title: "My Favourites", count: "18 episodes", icon: Heart },
  { id: "p2", title: "Daily Devotion", count: "12 episodes", icon: Sun },
  { id: "p3", title: "Faith in Action", count: "15 episodes", icon: UserCheck },
  { id: "p4", title: "Worship & Praise", count: "24 episodes", icon: Music },
  { id: "p5", title: "Biblical Teachings", count: "21 episodes", icon: BookOpen },
];

export default function ListenerLibraryPage() {
  const { currentEpisode, isPlaying, togglePlay, playEpisode } = useAudioPlayer();
  const [activeTab, setActiveTab] = useState<
    "overview" | "saved" | "playlists" | "history" | "downloads"
  >("overview");

  // Saved episodes
  const savedEpisodes = EPISODES.slice(0, 4);

  // Recently played episodes (4 items)
  const recentlyPlayed = [
    { ep: EPISODES[1], time: "2 hours ago" },
    { ep: EPISODES[0], time: "1 day ago" },
    { ep: EPISODES[6], time: "3 days ago" },
    { ep: EPISODES[4], time: "5 days ago" },
  ];

  // Downloaded episodes (2 items)
  const downloadedEpisodes = [
    { ep: EPISODES[0], size: "120 MB" },
    { ep: EPISODES[1], size: "98 MB" },
  ];

  // History list (3 items)
  const historyList = EPISODES.slice(0, 3);

  const handlePlayEpisode = (e: React.MouseEvent, episode: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentEpisode?.id === episode.id) {
      togglePlay();
    } else {
      playEpisode(episode);
    }
  };

  return (
    <div className="px-4 md:px-8 py-6 space-y-8 pb-16">
      {/* 1. LIBRARY HERO OVERVIEW BANNER */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 border border-[#ff4500]/25 bg-gradient-to-r from-[#17100e] via-[#120f12] to-[#0d0b0e] shadow-xl">
        {/* Background Image Overlay with mountain horizon & traveler */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <Image
            src="/images/hero-volcanic-cross.jpg"
            alt="Horizon"
            fill
            className="object-cover object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0b0e] via-[#0d0b0e]/80 to-transparent" />
        </div>

        <div className="relative z-10 space-y-4">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Your <span className="text-[#ff4500]">Library</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#a5a6af] mt-1 font-sans">
              Your saved episodes, playlists, and listening journey — all in one place.
            </p>
          </div>

          {/* Filter Tabs Pill Row matching reference image */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
            {[
              { id: "overview", label: "Overview" },
              { id: "saved", label: "Saved Episodes" },
              { id: "playlists", label: "Playlists" },
              { id: "history", label: "Listening History" },
              { id: "downloads", label: "Downloads" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-[#ff4500] text-white shadow-[0_0_15px_rgba(255,69,0,0.6)]"
                    : "bg-[#141316] text-[#a5a6af] hover:text-white hover:bg-[#1f1e22] border border-[#222125]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. TWO-COLUMN SPLIT CONTAINER (Main Left/Center + Right Stats Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT / CENTER SECTIONS (COL 1-8) */}
        <div className="lg:col-span-8 space-y-8">
          {/* A. SAVED EPISODES */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#ffb13b]" />
                Saved Episodes
              </h2>
              <Link
                href="/saved"
                className="text-xs text-[#a5a6af] hover:text-[#ffb13b] flex items-center gap-1 font-sans transition-colors"
              >
                See all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 4 Saved Episode Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {savedEpisodes.map((episode) => {
                const isPlayingThis =
                  isPlaying && currentEpisode?.id === episode.id;

                return (
                  <div
                    key={episode.id}
                    className="group flex flex-col cursor-pointer"
                    onClick={(e) => handlePlayEpisode(e, episode)}
                  >
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-2 border border-[#222125] bg-[#141315] shadow-lg group-hover:border-[#ff4500]/50 transition-all duration-300">
                      <Image
                        src={episode.artworkUrl}
                        alt={episode.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Duration Badge on Top Left */}
                      <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-mono text-[#f5f0ea]">
                        {formatTime(episode.durationSeconds)}
                      </span>

                      {/* Three dots on Top Right */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-[#a5a6af] hover:text-white"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>

                      {/* Circular Yellow Play Button */}
                      <button
                        onClick={(e) => handlePlayEpisode(e, episode)}
                        className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-[#f5a623] hover:bg-[#ffb13b] text-black flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95 z-10"
                        aria-label={`Play ${episode.title}`}
                      >
                        {isPlayingThis ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>
                    </div>

                    <h3 className="font-heading text-xs font-bold text-white group-hover:text-[#ffb13b] transition-colors truncate">
                      {episode.title}
                    </h3>
                    <p className="text-[10px] text-[#a5a6af] truncate">
                      {episode.seriesTitle}
                    </p>
                    <p className="text-[9px] text-[#6e6f77] mt-0.5 font-mono">
                      {episode.publishedAt.slice(0, 10)}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* B. PLAYLISTS */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-[#ffb13b]" />
                Playlists
              </h2>
              <Link
                href="/playlists"
                className="text-xs text-[#a5a6af] hover:text-[#ffb13b] flex items-center gap-1 font-sans transition-colors"
              >
                See all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 6 Playlists Grid (5 collections + 1 Create Playlist) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {ALL_PLAYLISTS.map((pl) => {
                const Icon = pl.icon;
                return (
                  <div
                    key={pl.id}
                    className="p-3.5 rounded-2xl bg-gradient-to-b from-[#18161a] to-[#111013] border border-[#262429] hover:border-[#ff4500]/50 transition-all duration-200 group flex flex-col items-center justify-center text-center gap-2 shadow-md hover:-translate-y-0.5 cursor-pointer"
                  >
                    <div className="p-3 rounded-full bg-[#ffb13b]/10 text-[#ffb13b] group-hover:text-[#ff4500] group-hover:bg-[#ff4500]/10 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-heading text-xs font-bold text-white group-hover:text-[#ffb13b] transition-colors truncate max-w-full">
                      {pl.title}
                    </span>
                    <span className="text-[9px] text-[#6e6f77] font-mono">
                      {pl.count}
                    </span>
                  </div>
                );
              })}

              {/* Create Playlist Card */}
              <div
                onClick={() => {}}
                className="p-3.5 rounded-2xl border-2 border-dashed border-[#2d2b31] hover:border-[#ff4500]/60 bg-[#121114]/60 hover:bg-[#18171a] transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer group"
              >
                <div className="p-2.5 rounded-full bg-[#1e1d21] text-[#a5a6af] group-hover:text-[#ff4500] transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="font-heading text-xs font-bold text-[#a5a6af] group-hover:text-white transition-colors">
                  Create Playlist
                </span>
              </div>
            </div>
          </section>

          {/* C. LISTENING HISTORY TABLE */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <History className="w-4 h-4 text-[#ffb13b]" />
                Listening History
              </h2>
              <Link
                href="/history"
                className="text-xs text-[#a5a6af] hover:text-[#ffb13b] flex items-center gap-1 font-sans transition-colors"
              >
                See all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-[#111013] border border-[#222125] overflow-hidden shadow-md">
              <div className="grid grid-cols-12 px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider text-[#6e6f77] border-b border-[#201f23]">
                <div className="col-span-6">Episode</div>
                <div className="col-span-3">Show</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-1 text-right">Duration</div>
              </div>

              <div className="divide-y divide-[#1e1d21]">
                {historyList.map((ep) => {
                  const isPlayingThis =
                    isPlaying && currentEpisode?.id === ep.id;

                  return (
                    <div
                      key={ep.id}
                      className="grid grid-cols-12 px-4 py-3 items-center hover:bg-[#161518] transition-colors group cursor-pointer"
                      onClick={(e) => handlePlayEpisode(e, ep)}
                    >
                      {/* Episode Thumbnail + Play + Title */}
                      <div className="col-span-6 flex items-center gap-3 min-w-0 pr-2">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[#2a292f]">
                          <Image
                            src={ep.artworkUrl}
                            alt={ep.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          onClick={(e) => handlePlayEpisode(e, ep)}
                          className="w-6 h-6 rounded-full bg-[#f5a623] hover:bg-[#ffb13b] text-black flex items-center justify-center shrink-0 shadow-sm"
                          aria-label={`Play ${ep.title}`}
                        >
                          {isPlayingThis ? (
                            <Pause className="w-3 h-3 fill-current" />
                          ) : (
                            <Play className="w-3 h-3 fill-current ml-0.5" />
                          )}
                        </button>
                        <span className="font-heading text-xs font-semibold text-white group-hover:text-[#ffb13b] transition-colors truncate">
                          {ep.title}
                        </span>
                      </div>

                      {/* Show */}
                      <div className="col-span-3 text-xs text-[#a5a6af] truncate">
                        {ep.seriesTitle}
                      </div>

                      {/* Date */}
                      <div className="col-span-2 text-[11px] font-mono text-[#6e6f77]">
                        {ep.publishedAt.slice(0, 10)}
                      </div>

                      {/* Duration */}
                      <div className="col-span-1 text-[11px] font-mono text-[#a5a6af] text-right tabular-nums">
                        {formatTime(ep.durationSeconds)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT STATS SIDEBAR (COL 9-12) */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. Your Listening Journey Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#111013] border border-[#222125] shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-xs sm:text-sm font-bold text-white tracking-wide">
                Your Listening Journey
              </h3>
              <div className="flex items-center gap-1 text-[11px] font-mono text-[#a5a6af] bg-[#171619] px-2 py-0.5 rounded-md border border-[#262429] cursor-pointer">
                <span>This Month</span>
                <ChevronDown className="w-3 h-3 text-[#6e6f77]" />
              </div>
            </div>

            {/* 4 Stat Tiles Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Stat 1: Episodes Played */}
              <div className="p-3 rounded-2xl bg-[#151417] border border-[#222025] flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#ffb13b]/10 text-[#ffb13b] shrink-0">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-mono text-base font-bold text-white">28</p>
                  <p className="text-[10px] text-[#6e6f77] leading-tight">Episodes Played</p>
                </div>
              </div>

              {/* Stat 2: Total Listening */}
              <div className="p-3 rounded-2xl bg-[#151417] border border-[#222025] flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#ffb13b]/10 text-[#ffb13b] shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-mono text-base font-bold text-white">19h 24m</p>
                  <p className="text-[10px] text-[#6e6f77] leading-tight">Total Listening</p>
                </div>
              </div>

              {/* Stat 3: Episodes Saved */}
              <div className="p-3 rounded-2xl bg-[#151417] border border-[#222025] flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#ff4500]/10 text-[#ff4500] shrink-0">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-mono text-base font-bold text-white">12</p>
                  <p className="text-[10px] text-[#6e6f77] leading-tight">Episodes Saved</p>
                </div>
              </div>

              {/* Stat 4: Day Streak */}
              <div className="p-3 rounded-2xl bg-[#151417] border border-[#222025] flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#ff4500]/10 text-[#ff4500] shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-mono text-base font-bold text-white">7</p>
                  <p className="text-[10px] text-[#6e6f77] leading-tight">Day Streak</p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Scripture Callout Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#141215] border-l-4 border-[#ff4500] border-y border-r border-[#262429] space-y-1.5">
            <blockquote className="font-cinzel text-xs text-[#f5f0ea] italic leading-relaxed">
              &ldquo;Your word is a lamp for my feet, a light on my path.&rdquo;
            </blockquote>
            <p className="font-mono text-[10px] text-[#ff4500] font-bold">
              PSALM 119:105 (NIV)
            </p>
          </div>

          {/* 3. Recently Played Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#111013] border border-[#222125] shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-xs sm:text-sm font-bold text-white tracking-wide">
                Recently Played
              </h3>
              <Link
                href="/history"
                className="text-xs text-[#a5a6af] hover:text-[#ffb13b] flex items-center gap-1 font-sans transition-colors"
              >
                See all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentlyPlayed.map((item) => (
                <div
                  key={item.ep.id}
                  className="flex items-center gap-3 p-2 rounded-xl bg-[#151417] hover:bg-[#1c1b1f] border border-[#201f23] transition-all group cursor-pointer"
                  onClick={(e) => handlePlayEpisode(e, item.ep)}
                >
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[#2a292f]">
                    <Image
                      src={item.ep.artworkUrl}
                      alt={item.ep.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-xs font-bold text-white group-hover:text-[#ffb13b] transition-colors truncate">
                      {item.ep.title}
                    </p>
                    <p className="text-[10px] text-[#6e6f77] truncate">
                      {item.ep.seriesTitle} • {item.time}
                    </p>
                  </div>
                  <button
                    className="w-6 h-6 rounded-full bg-[#f5a623] hover:bg-[#ffb13b] text-black flex items-center justify-center shrink-0 shadow-sm"
                    aria-label={`Play ${item.ep.title}`}
                  >
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Downloaded Episodes Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#111013] border border-[#222125] shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-xs sm:text-sm font-bold text-white tracking-wide">
                Downloaded Episodes
              </h3>
              <Link
                href="/downloads"
                className="text-xs text-[#a5a6af] hover:text-[#ffb13b] flex items-center gap-1 font-sans transition-colors"
              >
                See all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {downloadedEpisodes.map((item) => (
                <div
                  key={item.ep.id}
                  className="flex items-center gap-3 p-2 rounded-xl bg-[#151417] hover:bg-[#1c1b1f] border border-[#201f23] transition-all group cursor-pointer"
                  onClick={(e) => handlePlayEpisode(e, item.ep)}
                >
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[#2a292f]">
                    <Image
                      src={item.ep.artworkUrl}
                      alt={item.ep.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-xs font-bold text-white group-hover:text-[#ffb13b] transition-colors truncate">
                      {item.ep.title}
                    </p>
                    <p className="text-[10px] text-[#6e6f77] truncate">
                      {item.ep.seriesTitle} • {item.size}
                    </p>
                  </div>
                  <button
                    className="w-6 h-6 rounded-full bg-[#f5a623] hover:bg-[#ffb13b] text-black flex items-center justify-center shrink-0 shadow-sm"
                    aria-label={`Play ${item.ep.title}`}
                  >
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 text-[#6e6f77] hover:text-white"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
