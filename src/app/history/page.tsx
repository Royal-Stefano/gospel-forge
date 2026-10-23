"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { History, Trash2, Compass } from "lucide-react";
import { EpisodeCard } from "@/components/podcast/EpisodeCard";
import { useAuth } from "@/context/AuthContext";

export default function HistoryPage() {
  const { currentUser, openAuthModal } = useAuth();
  const [historyEpisodes, setHistoryEpisodes] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    fetch("/api/library")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.listeningProgress) {
          const episodes = data.listeningProgress
            .filter((p: any) => p.episode)
            .map((p: any) => p.episode);
          setHistoryEpisodes(episodes);
        }
      })
      .catch(() => {});
  }, [currentUser]);

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

        {historyEpisodes.length > 0 && (
          <button
            onClick={() => setHistoryEpisodes([])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181719] border border-[#2a2929] text-xs font-mono text-[#a5a6af] hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {!currentUser ? (
        <div className="p-10 rounded-3xl bg-[#121113] border border-[#222123] text-center max-w-md mx-auto space-y-4">
          <History className="w-8 h-8 text-[#ff4500] mx-auto opacity-80" />
          <h3 className="font-heading text-lg font-bold text-white">Sign In for Listening History</h3>
          <p className="text-xs text-[#a5a6af]">
            Sign in to automatically track and resume where you left off across all your devices.
          </p>
          <button
            onClick={() => openAuthModal({ title: "Track Listening History", description: "Sign in to keep track of your streaming progress." })}
            className="px-6 py-2.5 rounded-full bg-[#ff4500] text-black font-heading font-bold text-xs uppercase tracking-wider hover:bg-[#e63900] transition-colors"
          >
            Sign In
          </button>
        </div>
      ) : historyEpisodes.length === 0 ? (
        <div className="p-10 rounded-3xl bg-[#121113] border border-[#222123] text-center max-w-md mx-auto space-y-4">
          <History className="w-8 h-8 text-[#6e6f77] mx-auto opacity-60" />
          <h3 className="font-heading text-lg font-bold text-white">No Listening History</h3>
          <p className="text-xs text-[#a5a6af]">
            You have not streamed any episodes yet. When you listen to messages, your progress will appear here.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#ff4500] text-black font-heading font-bold text-xs uppercase tracking-wider hover:bg-[#e63900] transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span>Start Listening</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {historyEpisodes.map((episode) => (
            <EpisodeCard key={episode.id} episode={episode} variant="horizontal" />
          ))}
        </div>
      )}
    </div>
  );
}
