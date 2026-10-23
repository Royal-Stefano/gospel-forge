"use client";

import React from "react";
import Image from "next/image";
import { ListMusic, Plus } from "lucide-react";
import { USER_PLAYLISTS } from "@/data/mockData";

export default function PlaylistsPage() {
  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#ffb13b]/15 text-[#ffb13b] border border-[#ffb13b]/30">
            <ListMusic className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-extrabold text-white tracking-wide">
              Playlists
            </h1>
            <p className="text-sm text-[#a5a6af] mt-0.5">
              Custom faith playlists and thematic collections.
            </p>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff4500] text-black font-heading font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_15px_rgba(255,69,0,0.5)] transition-all">
          <Plus className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {USER_PLAYLISTS.map((playlist) => (
          <div
            key={playlist.id}
            className="p-5 rounded-2xl bg-[#121113] hover:bg-[#1a191b] border border-[#222123] hover:border-[#ff4500]/40 transition-all flex items-center gap-4 group cursor-pointer"
          >
            <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-[#2a2929]">
              <Image
                src={playlist.coverUrl || "/images/gospel-forge-emblem.jpg"}
                alt={playlist.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-white group-hover:text-[#ffb13b] transition-colors truncate">
                {playlist.title}
              </h3>
              <p className="text-xs text-[#a5a6af] line-clamp-1 mt-1 font-body">
                {playlist.description}
              </p>
              <span className="text-[11px] font-mono text-[#6e6f77] mt-2 block">
                {playlist.itemCount} episodes • {playlist.isPublic ? "Public" : "Private"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
