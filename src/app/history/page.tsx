"use client";

import React from "react";
import { History, Trash2 } from "lucide-react";
import { EPISODES } from "@/data/mockData";
import { EpisodeCard } from "@/components/podcast/EpisodeCard";

export default function HistoryPage() {
  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#8f1609]/20 text-[#ff4500] border border-[#8f1609]/40">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-extrabold text-white tracking-wide">
              Listening History
            </h1>
            <p className="text-sm text-[#a5a6af] mt-0.5">
              Resume your recently streamed episodes and series.
            </p>
          </div>
        </div>

        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181719] border border-[#2a2929] text-xs font-mono text-[#a5a6af] hover:text-red-400 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="space-y-3">
        {EPISODES.map((episode) => (
          <EpisodeCard key={episode.id} episode={episode} variant="horizontal" />
        ))}
      </div>
    </div>
  );
}
