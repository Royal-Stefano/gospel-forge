"use client";

import React from "react";
import { Download, HardDrive } from "lucide-react";
import { EPISODES } from "@/data/mockData";
import { EpisodeCard } from "@/components/podcast/EpisodeCard";

export default function DownloadsPage() {
  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-[#1c1b1b] text-[#a5a6af] border border-[#2a2929]">
          <Download className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-white tracking-wide">
            Downloads & Offline
          </h1>
          <p className="text-sm text-[#a5a6af] mt-0.5">
            Keep the Word with you even without internet connectivity.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#121113] border border-[#222123] flex items-center justify-between text-xs font-mono text-[#a5a6af]">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-[#ffb13b]" />
          <span>Local Storage: 2.1 GB free of 64 GB</span>
        </div>
        <span className="text-emerald-400">Offline Sync Ready</span>
      </div>

      <div className="space-y-3">
        {EPISODES.slice(0, 2).map((episode) => (
          <EpisodeCard key={episode.id} episode={episode} variant="horizontal" />
        ))}
      </div>
    </div>
  );
}
