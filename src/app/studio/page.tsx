"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { VolcanicSummitCathedral } from "@/components/brand/VolcanicSummitCathedral";
import {
  UploadCloud,
  Headphones,
  Users,
  Heart,
  Download,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Play,
  Pause,
  Layers,
  BarChart3,
  Settings,
  Globe,
  Radio,
  Clock,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { usePodcastStore } from "@/context/PodcastStoreContext";
import { useAudioPlayer } from "@/context/AudioPlayerContext";

export default function ArtistStudioDashboard() {
  const { episodes } = usePodcastStore();
  const { currentEpisode, isPlaying, togglePlay, playEpisode } = useAudioPlayer();

  const [timeRange, setTimeRange] = useState("Last 30 Days");
  const [stats, setStats] = useState<{
    totalPlays: number;
    uniqueListeners: number;
    totalFollowers: number;
    totalDownloads: number;
  }>({
    totalPlays: 0,
    uniqueListeners: 0,
    totalFollowers: 0,
    totalDownloads: 0,
  });

  const [topEpisodes, setTopEpisodes] = useState<any[]>([]);

  React.useEffect(() => {
    fetch("/api/analytics/creator-stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.totalPlays === "number") {
          setStats({
            totalPlays: data.totalPlays,
            uniqueListeners: data.uniqueListeners || 0,
            totalFollowers: data.totalFollowers || 0,
            totalDownloads: data.totalDownloads || 0,
          });
          if (data.topEpisodes) {
            setTopEpisodes(data.topEpisodes);
          }
        }
      })
      .catch(() => {});
  }, []);

  const latestEpisodes = episodes.slice(0, 4);

  const recentActivity = [
    {
      icon: Users,
      color: "text-[#ffb13b]",
      text: "New listener from India",
      time: "2 minutes ago",
    },
    {
      icon: Headphones,
      color: "text-[#ff4500]",
      text: "5 new plays on Purpose in the Process",
      time: "12 minutes ago",
    },
    {
      icon: Heart,
      color: "text-[#ff4500]",
      text: "New follower",
      time: "1 hour ago",
    },
    {
      icon: MessageSquare,
      color: "text-[#ffb13b]",
      text: 'Comment on Faith Over Fear: "This episode blessed me!"',
      time: "2 hours ago",
    },
    {
      icon: Download,
      color: "text-[#a5a6af]",
      text: "Episode downloaded",
      time: "3 hours ago",
    },
  ];

  const handlePlay = (e: React.MouseEvent, ep: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentEpisode?.id === ep.id) {
      togglePlay();
    } else {
      playEpisode(ep);
    }
  };

  return (
    <div className="px-4 md:px-8 py-6 space-y-7 max-w-[1600px] mx-auto select-none">
      {/* 1. CREATOR STUDIO HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 border border-[#ff4500]/25 bg-gradient-to-r from-[#170e0b] via-[#121113] to-[#0c0b0c] shadow-2xl min-h-[160px] sm:min-h-[180px] flex flex-col justify-center">
        {/* Programmatic Vector Summit & Volcanic Glow */}
        <VolcanicSummitCathedral intensity="medium" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0b0c] via-[#0c0b0c]/85 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-1 max-w-xl">
          <p className="font-mono text-[10px] text-[#ff4500] font-bold tracking-[0.25em] uppercase">
            CREATOR STUDIO
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Create. Share. <span className="text-[#ff4500]">Impact.</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#a5a6af] font-sans pt-1">
            Equip, encourage, and reach the world with your message.
          </p>
        </div>
      </div>

      {/* 2. TOP METRICS ROW & PRIMARY UPLOAD ACTION BUTTON */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-center">
        {/* Metric 1: Total Plays */}
        <div className="lg:col-span-2 p-4 rounded-2xl bg-[#111013] border border-[#222125] flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-[#ffb13b]" />
              <span className="font-heading text-lg font-bold text-white">{stats.totalPlays.toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-[#6e6f77] font-mono">Total Plays</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono font-bold text-emerald-400">▲ +18%</span>
            {/* Mini Sparkline Bars */}
            <div className="flex items-end gap-0.5 h-4 mt-1 justify-end">
              <span className="w-1 h-2 bg-[#ff4500] rounded-t-sm" />
              <span className="w-1 h-3 bg-[#ff4500] rounded-t-sm" />
              <span className="w-1 h-2.5 bg-[#ff4500] rounded-t-sm" />
              <span className="w-1 h-4 bg-[#ffb13b] rounded-t-sm" />
            </div>
          </div>
        </div>

        {/* Metric 2: Total Listeners */}
        <div className="lg:col-span-2 p-4 rounded-2xl bg-[#111013] border border-[#222125] flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#ffb13b]" />
              <span className="font-heading text-lg font-bold text-white">{stats.uniqueListeners.toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-[#6e6f77] font-mono">Total Listeners</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono font-bold text-emerald-400">▲ +24%</span>
            <div className="flex items-end gap-0.5 h-4 mt-1 justify-end">
              <span className="w-1 h-1.5 bg-[#ff4500] rounded-t-sm" />
              <span className="w-1 h-2.5 bg-[#ff4500] rounded-t-sm" />
              <span className="w-1 h-3.5 bg-[#ff4500] rounded-t-sm" />
              <span className="w-1 h-4 bg-[#ffb13b] rounded-t-sm" />
            </div>
          </div>
        </div>

        {/* Metric 3: Followers */}
        <div className="lg:col-span-2 p-4 rounded-2xl bg-[#111013] border border-[#222125] flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#ff4500]" />
              <span className="font-heading text-lg font-bold text-white">{stats.totalFollowers.toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-[#6e6f77] font-mono">Followers</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono font-bold text-emerald-400">▲ +12%</span>
            <div className="flex items-end gap-0.5 h-4 mt-1 justify-end">
              <span className="w-1 h-2 bg-[#ff4500] rounded-t-sm" />
              <span className="w-1 h-3 bg-[#ff4500] rounded-t-sm" />
              <span className="w-1 h-2 bg-[#ff4500] rounded-t-sm" />
              <span className="w-1 h-3.5 bg-[#ffb13b] rounded-t-sm" />
            </div>
          </div>
        </div>

        {/* Metric 4: Downloads */}
        <div className="lg:col-span-2 p-4 rounded-2xl bg-[#111013] border border-[#222125] flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-[#ffb13b]" />
              <span className="font-heading text-lg font-bold text-white">1,420</span>
            </div>
            <p className="text-[10px] text-[#6e6f77] font-mono">Downloads</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono font-bold text-emerald-400">▲ +31%</span>
            <div className="flex items-end gap-0.5 h-4 mt-1 justify-end">
              <span className="w-1 h-1.5 bg-[#ff4500] rounded-t-sm" />
              <span className="w-1 h-2 bg-[#ff4500] rounded-t-sm" />
              <span className="w-1 h-3 bg-[#ff4500] rounded-t-sm" />
              <span className="w-1 h-4 bg-[#ffb13b] rounded-t-sm" />
            </div>
          </div>
        </div>

        {/* Prominent Upload Action Button */}
        <div className="lg:col-span-4 flex items-center justify-start lg:justify-end">
          <Link
            href="/studio/episodes/new"
            className="w-full lg:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-gradient-to-r from-[#ff4500] to-[#e63900] text-white font-heading font-bold text-xs sm:text-sm tracking-wide shadow-[0_0_25px_rgba(255,69,0,0.6)] hover:scale-105 active:scale-95 transition-all"
          >
            <UploadCloud className="w-5 h-5" />
            <span>Upload New Episode</span>
          </Link>
        </div>
      </div>

      {/* 3. MIDDLE ROW (Performance Overview + Audience Location + Quick Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Performance Overview (Chart Column: col-span-5) */}
        <div className="lg:col-span-5 p-5 rounded-3xl bg-[#111013] border border-[#222125] shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3">
            <h3 className="font-heading text-xs sm:text-sm font-bold text-white tracking-wide">
              Performance Overview
            </h3>
            <div className="flex items-center gap-1 text-[10px] font-mono text-[#a5a6af] bg-[#161518] px-2 py-0.5 rounded-md border border-[#262429]">
              <span>{timeRange}</span>
              <ChevronDown className="w-3 h-3 text-[#6e6f77]" />
            </div>
          </div>

          {/* SVG Smooth Performance Multi-Line Chart */}
          <div className="relative w-full h-44 my-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 400 140">
              {/* Horizontal Grid lines */}
              <line x1="0" y1="20" x2="400" y2="20" stroke="#1f1e23" strokeDasharray="2 2" />
              <line x1="0" y1="60" x2="400" y2="60" stroke="#1f1e23" strokeDasharray="2 2" />
              <line x1="0" y1="100" x2="400" y2="100" stroke="#1f1e23" strokeDasharray="2 2" />

              {/* Plays Line (Orange #ff4500) */}
              <path
                d="M0,110 C40,95 80,120 120,80 C160,85 200,60 240,75 C280,45 320,30 360,65 C380,55 400,60 400,60"
                fill="none"
                stroke="#ff4500"
                strokeWidth="2.5"
              />

              {/* Listeners Line (Amber #ffb13b) */}
              <path
                d="M0,125 C40,110 80,115 120,95 C160,100 200,85 240,90 C280,75 320,60 360,80 C380,70 400,75 400,75"
                fill="none"
                stroke="#ffb13b"
                strokeWidth="2"
              />

              {/* Downloads Line (Ash Gray #a5a6af) */}
              <path
                d="M0,135 C40,128 80,130 120,115 C160,120 200,105 240,110 C280,95 320,85 360,100 C380,95 400,98 400,98"
                fill="none"
                stroke="#6e6f77"
                strokeWidth="1.5"
              />
            </svg>

            {/* Dates along X axis */}
            <div className="flex justify-between text-[9px] font-mono text-[#6e6f77] pt-2">
              <span>Sep 25</span>
              <span>Sep 30</span>
              <span>Oct 5</span>
              <span>Oct 10</span>
              <span>Oct 15</span>
              <span>Oct 20</span>
              <span>Oct 25</span>
            </div>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center gap-4 text-[10px] font-mono text-[#a5a6af] pt-2 border-t border-[#1e1d21]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-[#ff4500]" /> Plays
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-[#ffb13b]" /> Listeners
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-[#6e6f77]" /> Downloads
            </span>
          </div>
        </div>

        {/* Audience Location (col-span-4) */}
        <div className="lg:col-span-4 p-5 rounded-3xl bg-[#111013] border border-[#222125] shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <h3 className="font-heading text-xs sm:text-sm font-bold text-white tracking-wide">
              Audience Location
            </h3>
            <Link href="/studio/analytics" className="text-xs text-[#a5a6af] hover:text-[#ffb13b] flex items-center gap-1 font-sans">
              See all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* World Map Simulation */}
          <div className="relative h-28 my-1 flex items-center justify-center opacity-70">
            <Globe className="w-20 h-20 text-[#2a292f] animate-pulse" />
            <div className="absolute top-6 left-12 w-2 h-2 rounded-full bg-[#ff4500] shadow-[0_0_8px_#ff4500]" />
            <div className="absolute top-10 right-14 w-2 h-2 rounded-full bg-[#ffb13b] shadow-[0_0_8px_#ffb13b]" />
            <div className="absolute bottom-6 right-20 w-1.5 h-1.5 rounded-full bg-[#ff4500]" />
          </div>

          {/* Location Percentage Bars */}
          <div className="space-y-2 text-xs font-mono">
            {[
              { country: "United States", flag: "🇺🇸", pct: "32%" },
              { country: "India", flag: "🇮🇳", pct: "28%" },
              { country: "United Kingdom", flag: "🇬🇧", pct: "12%" },
              { country: "Canada", flag: "🇨🇦", pct: "8%" },
              { country: "Australia", flag: "🇦🇺", pct: "6%" },
            ].map((loc) => (
              <div key={loc.country} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#a5a6af] text-[11px]">
                  <span>{loc.flag}</span>
                  <span>{loc.country}</span>
                </span>
                <span className="text-white text-[11px] font-bold">{loc.pct}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions (col-span-3) */}
        <div className="lg:col-span-3 p-5 rounded-3xl bg-[#111013] border border-[#222125] shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <h3 className="font-heading text-xs sm:text-sm font-bold text-white tracking-wide">
              Quick Actions
            </h3>
            <ChevronRight className="w-3.5 h-3.5 text-[#6e6f77]" />
          </div>

          <div className="space-y-2.5 py-1">
            <Link
              href="/studio/episodes/new"
              className="flex items-center gap-3 p-3 rounded-2xl bg-[#161518] hover:bg-[#1f1e23] border border-[#252429] text-xs font-semibold text-white transition-all group"
            >
              <UploadCloud className="w-4 h-4 text-[#ff4500] group-hover:scale-110 transition-transform" />
              <span>Upload New Episode</span>
            </Link>

            <Link
              href="/studio/series"
              className="flex items-center gap-3 p-3 rounded-2xl bg-[#161518] hover:bg-[#1f1e23] border border-[#252429] text-xs font-semibold text-white transition-all group"
            >
              <Layers className="w-4 h-4 text-[#ffb13b] group-hover:scale-110 transition-transform" />
              <span>Create New Series</span>
            </Link>

            <Link
              href="/studio/analytics"
              className="flex items-center gap-3 p-3 rounded-2xl bg-[#161518] hover:bg-[#1f1e23] border border-[#252429] text-xs font-semibold text-white transition-all group"
            >
              <BarChart3 className="w-4 h-4 text-[#ff4500] group-hover:scale-110 transition-transform" />
              <span>View Analytics</span>
            </Link>

            <Link
              href="/studio/settings"
              className="flex items-center gap-3 p-3 rounded-2xl bg-[#161518] hover:bg-[#1f1e23] border border-[#252429] text-xs font-semibold text-white transition-all group"
            >
              <Settings className="w-4 h-4 text-[#a5a6af] group-hover:scale-110 transition-transform" />
              <span>Manage Podcast</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM ROW (Latest Episodes Table + Top Episodes Ranked + Recent Activity Feed) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Latest Episodes Table (col-span-5) */}
        <div className="lg:col-span-5 p-5 rounded-3xl bg-[#111013] border border-[#222125] shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="font-heading text-xs sm:text-sm font-bold text-white tracking-wide">
              Latest Episodes
            </h3>
            <Link href="/studio/episodes" className="text-xs text-[#a5a6af] hover:text-[#ffb13b] flex items-center gap-1 font-sans">
              See all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {latestEpisodes.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#a5a6af] space-y-3">
              <p>No episodes uploaded yet.</p>
              <Link
                href="/studio/episodes/new"
                className="inline-block px-4 py-1.5 rounded-full bg-[#ff4500] text-black font-heading font-bold text-xs uppercase tracking-wider hover:bg-[#e63900] transition-colors"
              >
                Upload First Episode
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#1e1d21] text-xs">
              {latestEpisodes.map((ep) => (
                <div key={ep.id} className="py-2.5 flex items-center justify-between gap-3 group">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-[#262429]">
                      <Image src={ep.artworkUrl} alt={ep.title} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-heading text-xs font-semibold text-white truncate group-hover:text-[#ffb13b]">
                        {ep.title}
                      </p>
                      <p className="text-[10px] text-[#6e6f77] font-mono">
                        {ep.publishedAt ? new Date(ep.publishedAt).toLocaleDateString() : "Draft"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                        ep.status === "published"
                          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                          : "bg-[#251f15] text-[#ffb13b] border border-[#ffb13b]/30"
                      }`}
                    >
                      ● {ep.status || "draft"}
                    </span>

                    <span className="text-[10px] font-mono text-[#a5a6af] w-8 text-right">
                      {ep.playCount || 0}
                    </span>

                    <button
                      onClick={(e) => handlePlay(e, ep)}
                      className="w-6 h-6 rounded-full bg-[#f5a623] hover:bg-[#ffb13b] text-black flex items-center justify-center shrink-0 shadow-sm"
                    >
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Episodes Ranked (col-span-4) */}
        <div className="lg:col-span-4 p-5 rounded-3xl bg-[#111013] border border-[#222125] shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="font-heading text-xs sm:text-sm font-bold text-white tracking-wide">
              Top Episodes
            </h3>
            <div className="flex items-center gap-1 text-[10px] font-mono text-[#a5a6af] bg-[#161518] px-2 py-0.5 rounded-md border border-[#262429]">
              <span>{timeRange}</span>
              <ChevronDown className="w-3 h-3 text-[#6e6f77]" />
            </div>
          </div>

          {topEpisodes.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#a5a6af]">
              Top episodes will appear here once listeners stream your teachings.
            </div>
          ) : (
            <div className="space-y-2">
              {topEpisodes.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex items-center gap-3 p-2 rounded-xl bg-[#151417] hover:bg-[#1a191d] border border-[#201f23] transition-colors group cursor-pointer"
                  onClick={(e) => handlePlay(e, item)}
                >
                  <span className="font-mono text-xs font-bold text-[#6e6f77] w-3 text-center">
                    {item.rank || idx + 1}
                  </span>
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-[#262429]">
                    <Image src={item.artworkUrl} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-xs font-semibold text-white group-hover:text-[#ffb13b] truncate">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-[#6e6f77] font-mono">{item.plays} plays</p>
                  </div>
                  <button
                    className="w-6 h-6 rounded-full bg-[#f5a623] hover:bg-[#ffb13b] text-black flex items-center justify-center shrink-0 shadow-sm"
                  >
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Feed (col-span-3) */}
        <div className="lg:col-span-3 p-5 rounded-3xl bg-[#111013] border border-[#222125] shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="font-heading text-xs sm:text-sm font-bold text-white tracking-wide">
              Recent Activity
            </h3>
            <Link href="/studio/community" className="text-xs text-[#a5a6af] hover:text-[#ffb13b] flex items-center gap-1 font-sans">
              See all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="py-8 text-center text-xs text-[#a5a6af]">
            No recent activity recorded yet.
          </div>
        </div>
      </div>
    </div>
  );
}
