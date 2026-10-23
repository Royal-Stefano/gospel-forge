"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Download, HardDrive, Compass } from "lucide-react";
import { EpisodeCard } from "@/components/podcast/EpisodeCard";

export default function DownloadsPage() {
  const [downloadedEpisodes] = useState<any[]>([]);

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
          <span>Offline Cache Storage Available</span>
        </div>
        <span className="text-emerald-400">Offline Sync Ready</span>
      </div>

      {downloadedEpisodes.length === 0 ? (
        <div className="p-10 rounded-3xl bg-[#121113] border border-[#222123] text-center max-w-md mx-auto space-y-4">
          <Download className="w-8 h-8 text-[#6e6f77] mx-auto opacity-60" />
          <h3 className="font-heading text-lg font-bold text-white">No Offline Downloads</h3>
          <p className="text-xs text-[#a5a6af]">
            You have not saved any episodes for offline listening yet.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#ff4500] text-black font-heading font-bold text-xs uppercase tracking-wider hover:bg-[#e63900] transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Episodes</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {downloadedEpisodes.map((episode) => (
            <EpisodeCard key={episode.id} episode={episode} variant="horizontal" />
          ))}
        </div>
      )}
    </div>
  );
}
