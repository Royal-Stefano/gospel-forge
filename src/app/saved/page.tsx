"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Compass } from "lucide-react";
import { EpisodeCard } from "@/components/podcast/EpisodeCard";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { usePodcastStore } from "@/context/PodcastStoreContext";
import { useAuth } from "@/context/AuthContext";

export default function SavedEpisodesPage() {
  const { savedEpisodeIds } = useAudioPlayer();
  const { getPublishedEpisodes } = usePodcastStore();
  const { currentUser, openAuthModal } = useAuth();
  const [savedEpisodes, setSavedEpisodes] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser) {
      setSavedEpisodes([]);
      return;
    }

    fetch("/api/library")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.savedEpisodes) {
          setSavedEpisodes(data.savedEpisodes);
        }
      })
      .catch(() => {
        // Fallback to store
        const published = getPublishedEpisodes();
        setSavedEpisodes(published.filter((ep) => savedEpisodeIds.includes(ep.id)));
      });
  }, [currentUser, savedEpisodeIds, getPublishedEpisodes]);

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-[#ff4500]/15 text-[#ff4500] border border-[#ff4500]/30">
          <Bookmark className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-white tracking-wide">
            Saved Episodes
          </h1>
          <p className="text-sm text-[#a5a6af] mt-0.5">
            Episodes you have bookmarked for deep study and re-listening.
          </p>
        </div>
      </div>

      {!currentUser ? (
        <div className="p-10 rounded-3xl bg-[#121113] border border-[#222123] text-center max-w-md mx-auto space-y-4">
          <Bookmark className="w-8 h-8 text-[#ff4500] mx-auto opacity-80" />
          <h3 className="font-heading text-lg font-bold text-white">Sign In to View Saved Episodes</h3>
          <p className="text-xs text-[#a5a6af]">
            Sign in to access your personal collection of bookmarked sermons and podcasts across all devices.
          </p>
          <button
            onClick={() => openAuthModal({ title: "View Saved Episodes", description: "Sign in to access your saved episodes." })}
            className="px-6 py-2.5 rounded-full bg-[#ff4500] text-black font-heading font-bold text-xs uppercase tracking-wider hover:bg-[#e63900] transition-colors"
          >
            Sign In
          </button>
        </div>
      ) : savedEpisodes.length === 0 ? (
        <div className="p-10 rounded-3xl bg-[#121113] border border-[#222123] text-center max-w-md mx-auto space-y-4">
          <Bookmark className="w-8 h-8 text-[#6e6f77] mx-auto opacity-60" />
          <h3 className="font-heading text-lg font-bold text-white">No Saved Episodes Yet</h3>
          <p className="text-xs text-[#a5a6af]">
            Click the bookmark or heart icon while listening to any episode to save it here.
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {savedEpisodes.map((ep) => (
            <EpisodeCard key={ep.id} episode={ep} variant="vertical" />
          ))}
        </div>
      )}
    </div>
  );
}
