"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
  Play,
  Pause,
  Heart,
  Share2,
  Bookmark,
  Clock,
  Calendar,
  Layers,
  BookOpen,
  ChevronRight,
  MessageSquare,
  FileText,
  Info,
} from "lucide-react";
import { EPISODES, SERIES_LIST } from "@/data/mockData";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { formatTime, formatDate, cn } from "@/lib/utils";

export default function EpisodeDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const episode = EPISODES.find((e) => e.slug === slug) || EPISODES[0];

  const {
    currentEpisode,
    isPlaying,
    playEpisode,
    togglePlay,
    toggleSaveEpisode,
    isEpisodeSaved,
  } = useAudioPlayer();

  const [activeTab, setActiveTab] = useState<
    "about" | "notes" | "transcript" | "community"
  >("about");

  const isCurrent = currentEpisode?.id === episode.id;
  const isPlayingCurrent = isCurrent && isPlaying;
  const isSaved = isEpisodeSaved(episode.id);

  const seriesEpisodes = EPISODES.filter(
    (e) => e.seriesId === episode.seriesId && e.id !== episode.id
  );

  const handlePlayToggle = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playEpisode(episode);
    }
  };

  return (
    <div className="px-4 md:px-8 py-6 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-mono text-[#a5a6af]">
        <Link href="/browse" className="hover:text-white transition-colors">
          Episodes
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-white truncate">{episode.title}</span>
      </nav>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-gradient-to-br from-[#161110] via-[#111113] to-[#0a0a0b] p-6 md:p-8 rounded-3xl border border-[#ff4500]/25 shadow-2xl">
        {/* Large Artwork */}
        <div className="lg:col-span-4 flex justify-center">
          <div className="relative aspect-square w-full max-w-sm rounded-2xl overflow-hidden border-2 border-[#ff4500]/30 shadow-[0_0_35px_rgba(255,69,0,0.3)]">
            <Image
              src={episode.artworkUrl}
              alt={episode.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Episode Meta & Action */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-[#ff4500]/15 border border-[#ff4500]/40 text-[#ffb13b] text-xs font-mono font-bold uppercase tracking-wider">
              Episode 0{episode.episodeNumber || 1}
            </span>
            <span className="text-xs text-[#a5a6af] font-mono">• Season {episode.seasonNumber || 1}</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
            {episode.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#a5a6af]">
            <Link
              href={`/series/${episode.seriesId}`}
              className="text-[#ffb13b] hover:underline font-semibold"
            >
              {episode.seriesTitle}
            </Link>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(episode.publishedAt)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(episode.durationSeconds)}
            </span>
          </div>

          <p className="text-sm text-[#a5a6af] font-body leading-relaxed max-w-2xl">
            {episode.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-3">
            <button
              onClick={handlePlayToggle}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-[#ff4500] to-[#ffb13b] text-[#080706] font-heading font-bold text-sm tracking-wider uppercase hover:shadow-[0_0_25px_rgba(255,69,0,0.7)] hover:scale-105 active:scale-95 transition-all duration-200"
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
              onClick={() => toggleSaveEpisode(episode.id)}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-3 rounded-full border transition-all text-sm font-semibold",
                isSaved
                  ? "bg-[#ff4500]/15 text-[#ff4500] border-[#ff4500]"
                  : "bg-[#181719] text-white border-[#2a2929] hover:border-[#ff4500]/50"
              )}
            >
              <Heart className={cn("w-4 h-4", isSaved && "fill-[#ff4500]")} />
              <span>{isSaved ? "Saved" : "+ Save"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Tabs Content on Left, More from this Series on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Tabs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tabs bar */}
          <div className="flex items-center gap-6 border-b border-[#222123] pb-3 text-sm font-semibold">
            {[
              { id: "about", label: "About", icon: Info },
              { id: "notes", label: "Show Notes", icon: FileText },
              { id: "transcript", label: "Transcript", icon: BookOpen },
              { id: "community", label: "Community (128)", icon: MessageSquare },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 pb-2 relative transition-colors",
                    activeTab === tab.id
                      ? "text-[#ff4500]"
                      : "text-[#a5a6af] hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-[#ff4500] shadow-[0_0_8px_#ff4500]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB 1: ABOUT */}
          {activeTab === "about" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="space-y-3">
                <h3 className="font-heading text-lg font-bold text-white">
                  Episode Summary
                </h3>
                <p className="text-sm text-[#a5a6af] font-body leading-relaxed">
                  {episode.description}
                </p>
              </div>

              {/* Topics Pills */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#6e6f77] mb-2">
                  Topics
                </h4>
                <div className="flex flex-wrap gap-2">
                  {episode.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1 rounded-full bg-[#181719] text-xs font-mono text-[#f5f0ea] border border-[#2a2929]"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Scripture References */}
              {episode.scriptureReferences && (
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#6e6f77] mb-2">
                    Scripture Anchors
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {episode.scriptureReferences.map((ref) => (
                      <span
                        key={ref}
                        className="px-3 py-1 rounded-full bg-[#ff4500]/10 text-xs font-cinzel text-[#ffb13b] border border-[#ff4500]/30"
                      >
                        {ref}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SHOW NOTES */}
          {activeTab === "notes" && (
            <div className="p-6 rounded-2xl bg-[#121113] border border-[#222123] whitespace-pre-line text-sm text-[#a5a6af] font-mono leading-relaxed animate-in fade-in">
              {episode.showNotes || "Show notes are being transcribed for this episode."}
            </div>
          )}

          {/* TAB 3: TRANSCRIPT */}
          {activeTab === "transcript" && (
            <div className="p-6 rounded-2xl bg-[#121113] border border-[#222123] whitespace-pre-line text-sm text-[#f5f0ea] font-body leading-loose animate-in fade-in">
              {episode.transcript || "Full verified transcript will appear here shortly."}
            </div>
          )}

          {/* TAB 4: COMMUNITY */}
          {activeTab === "community" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-[#141314] border border-[#262527] flex gap-3">
                <input
                  type="text"
                  placeholder="Share a reflection on this episode..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-[#6e6f77] focus:outline-none"
                />
                <button className="px-4 py-2 rounded-lg bg-[#ff4500] text-black font-semibold text-xs uppercase font-heading">
                  Post
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#141314] border border-[#222123] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Sarah K.</span>
                  <span className="text-[#6e6f77]">2 hours ago</span>
                </div>
                <p className="text-sm text-[#a5a6af]">
                  The analogy of the furnace in James 1 completely shifted how I view my current job situation. Glory to God!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: More from this Series */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="font-heading text-lg font-bold text-white tracking-wide">
            More from this Series
          </h3>

          <div className="space-y-3">
            {seriesEpisodes.length === 0 ? (
              <p className="text-xs text-[#6e6f77]">No other episodes in this series yet.</p>
            ) : (
              seriesEpisodes.map((ep) => (
                <div
                  key={ep.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#121113] hover:bg-[#1a191b] border border-[#222123] hover:border-[#ff4500]/40 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-[#2a2929]">
                      <Image
                        src={ep.artworkUrl}
                        alt={ep.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/episodes/${ep.slug}`}
                        className="text-xs font-semibold text-white group-hover:text-[#ffb13b] transition-colors truncate block"
                      >
                        {ep.title}
                      </Link>
                      <span className="text-[10px] font-mono text-[#6e6f77]">
                        {formatTime(ep.durationSeconds)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => playEpisode(ep)}
                    className="p-2 rounded-full bg-[#1c1b1b] text-[#a5a6af] group-hover:text-black group-hover:bg-[#ff4500] transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
