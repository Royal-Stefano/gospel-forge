"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Play,
  Pause,
  ChevronRight,
  Flame,
  BookOpen,
  Users,
  Radio,
  Sparkles,
  Heart,
  Clock,
} from "lucide-react";
import { CinematicHero } from "@/components/home/CinematicHero";
import { EpisodeCard } from "@/components/podcast/EpisodeCard";
import { SeriesCard } from "@/components/podcast/SeriesCard";
import {
  SERIES_LIST,
  EPISODES,
  SPEAKERS,
  COMMUNITY_POSTS,
} from "@/data/mockData";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { formatTime } from "@/lib/utils";

export default function HomePage() {
  const { currentEpisode, isPlaying, togglePlay } = useAudioPlayer();

  const scriptures = [
    { ref: "Romans 8:28", desc: "God works all things together for good" },
    { ref: "James 1:2-4", desc: "Count it all joy when you meet trials" },
    { ref: "Isaiah 48:10", desc: "Refined you in the furnace of affliction" },
    { ref: "Psalm 27:1", desc: "The Lord is my light and my salvation" },
    { ref: "Matthew 6:33", desc: "Seek first the kingdom of God" },
  ];

  return (
    <div className="space-y-10">
      {/* 1. CINEMATIC HERO */}
      <CinematicHero />

      {/* 2. CONTINUE LISTENING */}
      {currentEpisode && (
        <section className="px-4 md:px-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff4500] shadow-[0_0_8px_#ff4500]" />
              Continue Listening
            </h2>
            <Link
              href="/history"
              className="text-xs font-mono text-[#a5a6af] hover:text-[#ffb13b] flex items-center gap-1"
            >
              History <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#171110] via-[#141314] to-[#121113] border border-[#ff4500]/30 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[#2a2929]">
                <Image
                  src={currentEpisode.artworkUrl}
                  alt={currentEpisode.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-[#ffb13b] uppercase tracking-wider">
                  {currentEpisode.seriesTitle}
                </span>
                <h3 className="text-base font-semibold text-white truncate">
                  {currentEpisode.title}
                </h3>
                <p className="text-xs text-[#a5a6af]">
                  Speaker: {currentEpisode.speaker.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
              <button
                onClick={togglePlay}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#ff4500] to-[#ffb13b] text-[#080706] font-heading font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(255,69,0,0.5)] hover:scale-105 transition-all"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    <span>Resume</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 3. FEATURED PODCASTS */}
      <section className="px-4 md:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-white tracking-wide">
              Featured Podcasts
            </h2>
            <p className="text-xs text-[#a5a6af]">
              Flagship audio experiences crafted for spiritual depth
            </p>
          </div>
          <Link
            href="/series"
            className="text-xs font-mono text-[#a5a6af] hover:text-[#ffb13b] flex items-center gap-1"
          >
            See All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {SERIES_LIST.map((series) => (
            <SeriesCard key={series.id} series={series} />
          ))}
        </div>
      </section>

      {/* 4. LATEST EPISODES */}
      <section className="px-4 md:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-white tracking-wide">
              Latest Episodes
            </h2>
            <p className="text-xs text-[#a5a6af]">
              Freshly released messages and conversations
            </p>
          </div>
          <Link
            href="/browse"
            className="text-xs font-mono text-[#a5a6af] hover:text-[#ffb13b] flex items-center gap-1"
          >
            View More <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EPISODES.slice(0, 4).map((episode) => (
            <EpisodeCard key={episode.id} episode={episode} variant="vertical" />
          ))}
        </div>
      </section>

      {/* 5. EXPLORE BY SCRIPTURE */}
      <section className="px-4 md:px-8">
        <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[#121113] to-[#0a0a0a] border border-[#222123]">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-[#ff4500]" />
            <h2 className="font-cinzel text-xl font-bold text-white tracking-wide">
              Explore by Scripture
            </h2>
          </div>
          <p className="text-xs text-[#a5a6af] mb-6">
            Anchor your listening in the timeless verses that inspire each message
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {scriptures.map((s) => (
              <Link
                key={s.ref}
                href={`/browse?q=${encodeURIComponent(s.ref)}`}
                className="p-4 rounded-xl bg-[#171618] hover:bg-[#1f1e21] border border-[#262527] hover:border-[#ff4500]/50 transition-all duration-200 group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="font-cinzel text-sm font-bold text-white group-hover:text-[#ffb13b] transition-colors">
                    {s.ref}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#6e6f77] group-hover:text-[#ff4500] transition-colors" />
                </div>
                <p className="text-xs text-[#a5a6af] mt-2 italic font-body">
                  &ldquo;{s.desc}&rdquo;
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. COMMUNITY CONVERSATIONS PREVIEW */}
      <section className="px-4 md:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-white tracking-wide flex items-center gap-2">
              <Users className="w-5 h-5 text-[#ff4500]" />
              Community Conversations
            </h2>
            <p className="text-xs text-[#a5a6af]">
              Real people. Real faith. Discussions forged in fellowship.
            </p>
          </div>
          <Link
            href="/community"
            className="text-xs font-mono text-[#a5a6af] hover:text-[#ffb13b] flex items-center gap-1"
          >
            Join Community <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMMUNITY_POSTS.slice(0, 2).map((post) => (
            <div
              key={post.id}
              className="p-5 rounded-2xl bg-[#121113] border border-[#222123] hover:border-[#ff4500]/30 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#2a2929]">
                    <Image
                      src={post.author.avatarUrl}
                      alt={post.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {post.author.name}
                    </h4>
                    <span className="text-[10px] text-[#6e6f77]">
                      {post.createdAt}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1c1b1b] text-[#ffb13b] border border-[#2a2929]">
                  {post.category}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#f5f0ea] font-body leading-relaxed">
                {post.content}
              </p>

              {post.attachedEpisodeTitle && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#181719] border border-[#262527] text-xs text-[#ffb13b]">
                  <Play className="w-3 h-3 text-[#ff4500]" />
                  <span className="truncate">
                    Attached: {post.attachedEpisodeTitle}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-4 text-xs font-mono text-[#a5a6af] pt-2 border-t border-[#1e1d1f]">
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-[#ff4500]" /> {post.likesCount}
                </span>
                <span>{post.repliesCount} replies</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. MEET THE SPEAKERS */}
      <section className="px-4 md:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-white tracking-wide">
              Meet the Speakers
            </h2>
            <p className="text-xs text-[#a5a6af]">
              Voices preaching the unfiltered Gospel with conviction
            </p>
          </div>
          <Link
            href="/speakers"
            className="text-xs font-mono text-[#a5a6af] hover:text-[#ffb13b] flex items-center gap-1"
          >
            All Speakers <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SPEAKERS.map((speaker) => (
            <div
              key={speaker.id}
              className="p-5 rounded-2xl bg-[#111113] border border-[#222123] hover:border-[#ff4500]/40 transition-all flex items-center gap-4 group"
            >
              <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-[#2a2929] group-hover:border-[#ff4500] transition-colors">
                <Image
                  src={speaker.avatarUrl}
                  alt={speaker.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white group-hover:text-[#ffb13b] transition-colors truncate">
                  {speaker.name}
                </h4>
                <p className="text-xs text-[#ff4500] truncate">{speaker.role}</p>
                <p className="text-[11px] text-[#6e6f77] mt-1 line-clamp-1">
                  {speaker.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. LISTEN EVERYWHERE FOOTER BANNER */}
      <section className="px-4 md:px-8 pb-6">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#170d09] via-[#111012] to-[#0a090b] border border-[#ff4500]/25 text-center space-y-4">
          <div className="inline-flex p-3 rounded-2xl bg-[#ff4500]/10 border border-[#ff4500]/30 text-[#ff4500]">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="font-heading text-2xl font-bold text-white tracking-wide">
            FAITH HAS A FREQUENCY. TAKE IT WITH YOU.
          </h3>
          <p className="text-xs sm:text-sm text-[#a5a6af] max-w-lg mx-auto">
            Gospel Forge is hosted on high-performance cloud infrastructure with
            instant continuous streaming, cross-device sync, and RSS feeds.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {["Apple Podcasts", "Spotify", "Amazon Music", "RSS Feed"].map(
              (platform) => (
                <span
                  key={platform}
                  className="px-4 py-2 rounded-full bg-[#181719] text-xs font-mono text-[#f5f0ea] border border-[#2a2929]"
                >
                  {platform}
                </span>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
