"use client";

import React from "react";
import Link from "next/link";
import { Bookmark, ListMusic, History, Download, Layers } from "lucide-react";
import { USER_PLAYLISTS, EPISODES } from "@/data/mockData";
import { EpisodeCard } from "@/components/podcast/EpisodeCard";

export default function LibraryPage() {
  return (
    <div className="px-4 md:px-8 py-6 space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-extrabold text-white tracking-wide">
          Your Library
        </h1>
        <p className="text-sm text-[#a5a6af] mt-1">
          Your saved episodes, playlists, and listening history.
        </p>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            title: "Saved Episodes",
            desc: "9 episodes",
            icon: Bookmark,
            href: "/saved",
            color: "#ff4500",
          },
          {
            title: "Playlists",
            desc: `${USER_PLAYLISTS.length} collections`,
            icon: ListMusic,
            href: "/playlists",
            color: "#ffb13b",
          },
          {
            title: "Listening History",
            desc: "Recently played",
            icon: History,
            href: "/history",
            color: "#8f1609",
          },
          {
            title: "Downloads",
            desc: "Offline listening",
            icon: Download,
            href: "/downloads",
            color: "#a5a6af",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className="p-5 rounded-2xl bg-[#121113] hover:bg-[#1a191b] border border-[#222123] hover:border-[#ff4500]/40 transition-all group flex flex-col justify-between"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${item.color}20` }}
              >
                <Icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-[#ffb13b] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-[#6e6f77] mt-0.5 font-mono">{item.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recently Saved */}
      <div>
        <h2 className="font-heading text-xl font-bold text-white mb-4">
          Recently Saved
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EPISODES.slice(0, 4).map((ep) => (
            <EpisodeCard key={ep.id} episode={ep} variant="vertical" />
          ))}
        </div>
      </div>
    </div>
  );
}
