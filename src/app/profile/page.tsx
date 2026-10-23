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
  LogOut,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { USER_PLAYLISTS, EPISODES } from "@/data/mockData";
import { EpisodeCard } from "@/components/podcast/EpisodeCard";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { currentUser, logout, openAuthModal, canAccessStudio } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "playlists" | "saved" | "history"
  >("playlists");

  if (!currentUser) {
    return (
      <div className="px-4 md:px-8 py-16 max-w-xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#ff4500]/15 text-[#ff4500] border border-[#ff4500]/40 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(255,69,0,0.4)]">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-white">
            Guest Listener Profile
          </h1>
          <p className="text-xs sm:text-sm text-[#a5a6af] mt-2 font-body leading-relaxed">
            You are browsing Gospel Forge as a guest. Sign in or create an account to save messages, curate personal faith playlists, and track your listening history.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() =>
              openAuthModal({
                title: "Create Account",
                description: "Join Gospel Forge to save episodes and sync progress.",
              })
            }
            className="px-6 py-3 rounded-full bg-gradient-to-r from-[#ff4500] to-[#ffb13b] text-black font-heading font-bold text-xs uppercase tracking-wider shadow-lg"
          >
            Create Free Account
          </button>
          <Link
            href="/login"
            className="px-6 py-3 rounded-full bg-[#181719] hover:bg-[#201f22] border border-[#262527] text-xs font-semibold text-white"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 space-y-8 max-w-5xl mx-auto">
      {/* Profile Header Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#161110] via-[#111113] to-[#0a0a0a] border border-[#ff4500]/25 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff4500]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[#ff4500] shadow-[0_0_25px_rgba(255,69,0,0.5)] shrink-0">
            <Image
              src={currentUser.avatarUrl}
              alt={currentUser.displayName}
              fill
              className="object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
                    {currentUser.displayName}
                  </h1>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#181719] text-[#ffb13b] border border-[#262527]">
                    {currentUser.role.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs font-mono text-[#a5a6af] mt-0.5">
                  @{currentUser.username} • {currentUser.email}
                </p>
              </div>

              <div className="flex items-center gap-2 justify-center sm:justify-end">
                {canAccessStudio && (
                  <Link
                    href="/studio"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ff4500]/15 hover:bg-[#ff4500]/25 border border-[#ff4500]/40 text-[#ffb13b] text-xs font-mono font-bold uppercase transition-all"
                  >
                    <Flame className="w-3.5 h-3.5 text-[#ff4500]" />
                    <span>Studio</span>
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1c1b1b] hover:bg-red-950/60 border border-[#2e2d2f] text-xs font-semibold text-[#a5a6af] hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#a5a6af] font-body max-w-xl">
              {currentUser.bio || "Gospel Forge audio streaming listener."}
            </p>

            {/* Artist Application Status Banner if applicable */}
            {currentUser.artistStatus === "pending" && (
              <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-200 text-xs font-mono flex items-center gap-2 mt-3">
                <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                <span>
                  Artist application submitted (Stone Altar Ministries). Status:{" "}
                  <strong>Under Review by Admin</strong>.
                </span>
              </div>
            )}

            {currentUser.artistStatus === "approved" && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs font-mono flex items-center gap-2 mt-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Artist account approved! You have authorized access to Gospel Forge Studio.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
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
