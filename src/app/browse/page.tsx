"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { VolcanicSummitCathedral } from "@/components/brand/VolcanicSummitCathedral";
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
  Radio,
  Flame,
  Search,
} from "lucide-react";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { usePodcastStore } from "@/context/PodcastStoreContext";
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
  { name: "Faith", icon: Cross },
  { name: "Purpose", icon: Compass },
  { name: "Relationships", icon: Heart },
  { name: "Bible", icon: BookOpen },
  { name: "Mental Health", icon: Brain },
  { name: "Work & Calling", icon: Briefcase },
  { name: "Family", icon: Users },
  { name: "Worship", icon: Music },
];

function DiscoverContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { currentEpisode, isPlaying, togglePlay, playEpisode } = useAudioPlayer();
  const { seriesList, speakers, getPublishedEpisodes, isLoading } = usePodcastStore();

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  const publishedEpisodes = getPublishedEpisodes();

  // Filter series by category and query
  const filteredSeries = useMemo(() => {
    return seriesList.filter((s) => {
      const matchCat =
        selectedCategory === "All" ||
        (s.category && s.category.toLowerCase() === selectedCategory.toLowerCase());
      const matchQ =
        !searchQuery ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQ;
    });
  }, [seriesList, selectedCategory, searchQuery]);

  // Filter episodes by query
  const filteredEpisodes = useMemo(() => {
    return publishedEpisodes.filter((ep) => {
      const matchQ =
        !searchQuery ||
        ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ep.topics || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchQ;
    });
  }, [publishedEpisodes, searchQuery]);

  const popularSeries = filteredSeries.slice(0, 6);
  const latestEpisodes = filteredEpisodes.slice(0, 4);
  const trendingEpisodes = [...filteredEpisodes]
    .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
    .slice(0, 3);

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
    <div className="space-y-8 px-4 md:px-8 py-6 pb-16">
      {/* 1. DISCOVER HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 border border-[#ff4500]/20 bg-gradient-to-r from-[#17100e] via-[#120f12] to-[#0d0b0e] shadow-xl">
        <VolcanicSummitCathedral intensity="medium" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0b0e] via-[#0d0b0e]/85 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Discover
            </h1>
            <p className="text-xs sm:text-sm text-[#a5a6af] mt-1 font-sans">
              Explore sound Christian podcasts, biblical topics, and voices from around the world.
            </p>
          </div>

          <div className="hidden lg:block text-right">
            <p className="font-cinzel text-sm text-[#ffb13b] italic tracking-wider">
              Faith. Culture. Life.
            </p>
            <p className="font-cinzel text-xs text-[#ff4500] italic tracking-widest">
              Purpose and Truth.
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH BAR & CATEGORY PILLS */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#a5a6af] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search series, episodes, scriptures, topics..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#141316] border border-[#222125] focus:border-[#ff4500] text-xs text-white placeholder-[#6e6f77] outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#a5a6af] hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* CATEGORY PILLS */}
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
      </div>

      {/* 2. POPULAR SERIES SECTION */}
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

        {popularSeries.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#121113]/80 border border-[#222125] text-center space-y-2">
            <Radio className="w-7 h-7 text-[#ff4500] mx-auto opacity-75" />
            <p className="font-heading text-sm font-semibold text-white">
              No series match your search
            </p>
            <p className="text-xs text-[#a5a6af] max-w-sm mx-auto">
              Try selecting &quot;All&quot; or refining your keywords.
            </p>
          </div>
        ) : (
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
                    {series.category}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. BROWSE BY TOPIC & FEATURED CREATORS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Browse by Topic */}
        <section className="lg:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-white tracking-tight">
              Browse by Topic
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TOPICS.map((topic) => {
              const Icon = topic.icon;
              return (
                <button
                  key={topic.name}
                  onClick={() => setSearchQuery(topic.name)}
                  className="p-4 rounded-2xl bg-gradient-to-b from-[#18161a] to-[#111013] border border-[#262429] hover:border-[#ff4500]/50 transition-all duration-200 group flex flex-col items-center justify-center text-center gap-2 shadow-md hover:-translate-y-0.5"
                >
                  <div className="p-3 rounded-full bg-[#ffb13b]/10 text-[#ffb13b] group-hover:text-[#ff4500] group-hover:bg-[#ff4500]/10 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-heading text-xs font-bold text-white group-hover:text-[#ffb13b] transition-colors">
                    {topic.name}
                  </span>
                </button>
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

          {speakers.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#121113]/80 border border-[#222125] text-center">
              <Users className="w-6 h-6 text-[#a5a6af] mx-auto opacity-70 mb-1" />
              <p className="text-xs text-[#a5a6af]">Creators will appear here once verified.</p>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-none">
              {speakers.map((speaker) => (
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
          )}
        </section>
      </div>

      {/* 4. LATEST EPISODES & TRENDING NOW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
        {/* Left: Latest Episodes */}
        <section className="lg:col-span-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-white tracking-tight">
              Latest Episodes
            </h2>
          </div>

          {latestEpisodes.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#121113]/80 border border-[#222125] text-center space-y-2">
              <Flame className="w-7 h-7 text-[#ffb13b] mx-auto opacity-75" />
              <p className="font-heading text-sm font-semibold text-white">
                No episodes found
              </p>
              <p className="text-xs text-[#a5a6af] max-w-sm mx-auto">
                No published episodes match your current search criteria.
              </p>
            </div>
          ) : (
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
                      {formatTime(episode.durationSeconds)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right: Trending Now */}
        <section className="lg:col-span-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-white tracking-tight">
              Trending Now
            </h2>
          </div>

          {trendingEpisodes.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#121113]/80 border border-[#222125] text-center">
              <p className="text-xs text-[#a5a6af]">No trending episodes yet.</p>
            </div>
          ) : (
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
                    <span className="font-mono text-sm font-bold text-[#6e6f77] w-4 text-center">
                      {idx + 1}
                    </span>

                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#28262c]">
                      <Image
                        src={episode.artworkUrl}
                        alt={episode.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

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
          )}
        </section>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 md:px-8 py-20 text-center text-xs font-mono text-[#a5a6af]">
          Loading Discover...
        </div>
      }
    >
      <DiscoverContent />
    </Suspense>
  );
}
