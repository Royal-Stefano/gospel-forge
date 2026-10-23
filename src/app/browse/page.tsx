"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Pause,
  ChevronRight,
  Cross,
  Compass,
  Heart,
  BookOpen,
  Brain,
  Briefcase,
  Users,
  Music,
  CheckCircle2,
} from "lucide-react";
import { SERIES_LIST, EPISODES, SPEAKERS } from "@/data/mockData";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { formatTime } from "@/lib/utils";

const CATEGORIES = [
  "All",
  "Faith",
  "Bible",
  "Life",
  "Worship",
  "Culture",
  "Youth",
  "Relationships",
  "Mental Health",
  "Family",
  "Leadership",
  "Missions",
];

const TOPICS = [
  { name: "Faith", icon: Cross, color: "from-[#2b1812] to-[#161214]" },
  { name: "Purpose", icon: Compass, color: "from-[#2a1d12] to-[#161214]" },
  { name: "Relationships", icon: Heart, color: "from-[#291417] to-[#161214]" },
  { name: "Bible", icon: BookOpen, color: "from-[#251a14] to-[#161214]" },
  { name: "Mental Health", icon: Brain, color: "from-[#201824] to-[#161214]" },
  { name: "Work & Calling", icon: Briefcase, color: "from-[#2a1d12] to-[#161214]" },
  { name: "Family", icon: Users, color: "from-[#231d16] to-[#161214]" },
  { name: "Worship", icon: Music, color: "from-[#2b1b16] to-[#161214]" },
];

export default function DiscoverPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { currentEpisode, isPlaying, togglePlay, playEpisode } = useAudioPlayer();

  // 6 series for Popular Series
  const popularSeries = SERIES_LIST.slice(0, 6);

  // 4 episodes for Latest Episodes row
  const latestEpisodes = EPISODES.slice(0, 4);

  // 3 trending episodes
  const trendingEpisodes = EPISODES.slice(4, 7);

  const handlePlayEpisode = (e: React.MouseEvent, episode: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentEpisode?.id === episode.id) {
      togglePlay();
    } else {
      playEpisode(episode);
    }
  };

  const handlePlaySeries = (e: React.MouseEvent, series: any) => {
    e.preventDefault();
    e.stopPropagation();
    const targetEpisode =
      EPISODES.find((ep) => ep.seriesId === series.id) || EPISODES[0];
    if (currentEpisode?.id === targetEpisode.id) {
      togglePlay();
    } else {
      playEpisode(targetEpisode);
    }
  };

  return (
    <div className="space-y-8 px-4 md:px-8 py-6 pb-16">
      {/* 1. DISCOVER HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 border border-[#ff4500]/20 bg-gradient-to-r from-[#17100e] via-[#120f12] to-[#0d0b0e] shadow-xl">
        {/* Background Image Overlay with mountain horizon */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <Image
            src="/images/hero-volcanic-cross.jpg"
            alt="Horizon"
            fill
            className="object-cover object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0b0e] via-[#0d0b0e]/80 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Discover
            </h1>
            <p className="text-xs sm:text-sm text-[#a5a6af] mt-1 font-sans">
              Explore Christian podcasts, topics, and voices from around the world.
            </p>
          </div>

          {/* Decorative Calligraphy on right matching image */}
          <div className="hidden lg:block text-right">
            <p className="font-cinzel text-sm text-[#ffb13b] italic tracking-wider">
              Faith. Culture. Life.
            </p>
            <p className="font-cinzel text-xs text-[#ff4500] italic tracking-widest">
              Purpose and More.
            </p>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY PILLS BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              selectedCategory === cat
                ? "bg-[#ff4500] text-white shadow-[0_0_15px_rgba(255,69,0,0.6)]"
                : "bg-[#141316] text-[#a5a6af] hover:text-white hover:bg-[#1f1e22] border border-[#222125]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. POPULAR SERIES SECTION */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg sm:text-xl font-bold text-white tracking-tight">
            Popular Series
          </h2>
          <Link
            href="/series"
            className="text-xs text-[#a5a6af] hover:text-[#ffb13b] flex items-center gap-1 font-sans transition-colors"
          >
            See all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 6 Square Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {popularSeries.map((series) => {
            const isPlayingThis =
              isPlaying && currentEpisode?.seriesId === series.id;

            return (
              <div
                key={series.id}
                className="group flex flex-col cursor-pointer"
                onClick={(e) => handlePlaySeries(e, series)}
              >
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-2.5 border border-[#222125] bg-[#141315] shadow-lg group-hover:border-[#ff4500]/50 transition-all duration-300">
                  <Image
                    src={series.artworkUrl}
                    alt={series.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Yellow Circular Play Button */}
                  <button
                    onClick={(e) => handlePlaySeries(e, series)}
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

                <h3 className="font-heading text-xs sm:text-sm font-bold text-white group-hover:text-[#ffb13b] transition-colors truncate">
                  {series.title}
                </h3>
                <p className="text-[10px] text-[#6e6f77] mt-0.5">
                  {series.episodeCount} episodes
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. MIDDLE SECTION: BROWSE BY TOPIC (LEFT) + FEATURED CREATORS (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Browse by Topic */}
        <section className="lg:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-white tracking-tight">
              Browse by Topic
            </h2>
            <Link
              href="/browse"
              className="text-xs text-[#a5a6af] hover:text-[#ffb13b] flex items-center gap-1 font-sans transition-colors"
            >
              See all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TOPICS.map((topic) => {
              const Icon = topic.icon;
              return (
                <Link
                  key={topic.name}
                  href={`/browse?q=${encodeURIComponent(topic.name)}`}
                  className="p-4 rounded-2xl bg-gradient-to-b from-[#18161a] to-[#111013] border border-[#262429] hover:border-[#ff4500]/50 transition-all duration-200 group flex flex-col items-center justify-center text-center gap-2 shadow-md hover:-translate-y-0.5"
                >
                  <div className="p-3 rounded-full bg-[#ffb13b]/10 text-[#ffb13b] group-hover:text-[#ff4500] group-hover:bg-[#ff4500]/10 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-heading text-xs font-bold text-white group-hover:text-[#ffb13b] transition-colors">
                    {topic.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Right: Featured Creators */}
        <section className="lg:col-span-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-white tracking-tight">
              Featured Creators
            </h2>
            <Link
              href="/speakers"
              className="text-xs text-[#a5a6af] hover:text-[#ffb13b] flex items-center gap-1 font-sans transition-colors"
            >
              See all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-none">
            {SPEAKERS.map((speaker) => (
              <Link
                key={speaker.id}
                href="/speakers"
                className="flex flex-col items-center text-center group min-w-[70px]"
              >
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[#ffb13b]/60 group-hover:border-[#ff4500] transition-colors shadow-md">
                  <Image
                    src={speaker.avatarUrl}
                    alt={speaker.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  {/* Verified badge */}
                  <div className="absolute bottom-0 right-0 bg-black rounded-full text-[#ffb13b]">
                    <CheckCircle2 className="w-4 h-4 fill-current" />
                  </div>
                </div>
                <h4 className="font-heading text-[11px] font-bold text-white group-hover:text-[#ffb13b] transition-colors mt-1.5 truncate max-w-[80px]">
                  {speaker.name}
                </h4>
                <p className="text-[9px] text-[#6e6f77] truncate max-w-[80px]">
                  {speaker.role}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* 5. BOTTOM SECTION: LATEST EPISODES (LEFT) + TRENDING NOW (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
        {/* Left: Latest Episodes (4 cards) */}
        <section className="lg:col-span-8">
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

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {latestEpisodes.map((episode) => {
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
                    {episode.publishedAt.slice(0, 10)} • {Math.round(episode.durationSeconds / 60)} min
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right: Trending Now (Ranked 1, 2, 3) */}
        <section className="lg:col-span-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-white tracking-tight">
              Trending Now
            </h2>
            <Link
              href="/browse"
              className="text-xs text-[#a5a6af] hover:text-[#ffb13b] flex items-center gap-1 font-sans transition-colors"
            >
              See all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {trendingEpisodes.map((episode, idx) => {
              const isPlayingThis =
                isPlaying && currentEpisode?.id === episode.id;

              return (
                <div
                  key={episode.id}
                  className="flex items-center gap-3.5 p-2.5 rounded-2xl bg-[#111013] hover:bg-[#18161a] border border-[#222025] hover:border-[#ff4500]/40 transition-all duration-200 group cursor-pointer"
                  onClick={(e) => handlePlayEpisode(e, episode)}
                >
                  {/* Rank Number */}
                  <span className="font-mono text-sm font-bold text-[#6e6f77] w-4 text-center">
                    {idx + 1}
                  </span>

                  {/* Thumbnail */}
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#28262c]">
                    <Image
                      src={episode.artworkUrl}
                      alt={episode.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Meta */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-heading text-xs font-bold text-white group-hover:text-[#ffb13b] transition-colors truncate">
                      {episode.title}
                    </h4>
                    <p className="text-[10px] text-[#a5a6af] truncate">
                      {episode.seriesTitle}
                    </p>
                  </div>

                  <span className="text-[10px] font-mono text-[#6e6f77] tabular-nums shrink-0">
                    {formatTime(episode.durationSeconds)}
                  </span>

                  {/* Yellow play button */}
                  <button
                    onClick={(e) => handlePlayEpisode(e, episode)}
                    className="w-7 h-7 rounded-full bg-[#f5a623] hover:bg-[#ffb13b] text-black flex items-center justify-center shrink-0 shadow-md transition-transform hover:scale-110 active:scale-95"
                    aria-label={`Play ${episode.title}`}
                  >
                    {isPlayingThis ? (
                      <Pause className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
