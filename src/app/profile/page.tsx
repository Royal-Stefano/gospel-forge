"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bookmark,
  ListMusic,
  History,
  Edit3,
  Flame,
  Play,
  Heart,
  Calendar,
} from "lucide-react";
import { CURRENT_USER, USER_PLAYLISTS, EPISODES } from "@/data/mockData";
import { EpisodeCard } from "@/components/podcast/EpisodeCard";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<
    "playlists" | "saved" | "history"
  >("playlists");

  return (
    <div className="px-4 md:px-8 py-6 space-y-8 max-w-5xl mx-auto">
      {/* Profile Header Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#161110] via-[#111113] to-[#0a0a0a] border border-[#ff4500]/25 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff4500]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[#ff4500] shadow-[0_0_25px_rgba(255,69,0,0.5)] shrink-0">
            <Image
              src={CURRENT_USER.avatarUrl}
              alt={CURRENT_USER.displayName}
              fill
              className="object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
                  {CURRENT_USER.displayName}
                </h1>
                <p className="text-xs font-mono text-[#ffb13b]">
                  @{CURRENT_USER.username}
                </p>
              </div>

              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1c1b1b] hover:bg-[#252426] border border-[#2e2d2f] text-xs font-semibold text-white transition-all">
                <Edit3 className="w-3.5 h-3.5 text-[#ff4500]" />
                <span>Edit Profile</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#a5a6af] font-body max-w-xl">
              {CURRENT_USER.bio}
            </p>

            {/* Stats row */}
            <div className="flex items-center justify-center sm:justify-start gap-6 pt-3 text-xs font-mono">
              <div>
                <span className="font-bold text-white text-sm">
                  {CURRENT_USER.playlistsCount}
                </span>{" "}
                <span className="text-[#6e6f77]">Playlists</span>
              </div>
              <span>•</span>
              <div>
                <span className="font-bold text-white text-sm">
                  {CURRENT_USER.followingCount}
                </span>{" "}
                <span className="text-[#6e6f77]">Following</span>
              </div>
              <span>•</span>
              <div>
                <span className="font-bold text-white text-sm">
                  {CURRENT_USER.followersCount}
                </span>{" "}
                <span className="text-[#6e6f77]">Followers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Playlists | Saved Episodes | Listening History */}
      <div className="flex items-center gap-6 border-b border-[#222123] pb-3 text-sm font-semibold">
        {[
          { id: "playlists", label: "Playlists", icon: ListMusic },
          { id: "saved", label: "Saved Episodes", icon: Bookmark },
          { id: "history", label: "Listening History", icon: History },
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

      {/* TAB CONTENT: PLAYLISTS */}
      {activeTab === "playlists" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in">
          {USER_PLAYLISTS.map((playlist) => (
            <div
              key={playlist.id}
              className="group p-4 rounded-2xl bg-[#121113] hover:bg-[#1a191b] border border-[#222123] hover:border-[#ff4500]/40 transition-all flex items-center gap-4 cursor-pointer"
            >
              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[#2a2929]">
                <Image
                  src={playlist.coverUrl || "/images/gospel-forge-emblem.jpg"}
                  alt={playlist.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-white group-hover:text-[#ffb13b] transition-colors truncate">
                  {playlist.title}
                </h4>
                <p className="text-xs text-[#a5a6af] line-clamp-1 mt-0.5">
                  {playlist.description}
                </p>
                <span className="text-[10px] font-mono text-[#6e6f77] mt-1 block">
                  {playlist.itemCount} episodes
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: SAVED EPISODES */}
      {activeTab === "saved" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in">
          {EPISODES.slice(0, 3).map((episode) => (
            <EpisodeCard key={episode.id} episode={episode} variant="vertical" />
          ))}
        </div>
      )}

      {/* TAB CONTENT: LISTENING HISTORY */}
      {activeTab === "history" && (
        <div className="space-y-3 animate-in fade-in">
          {EPISODES.map((episode) => (
            <EpisodeCard key={episode.id} episode={episode} variant="horizontal" />
          ))}
        </div>
      )}
    </div>
  );
}
