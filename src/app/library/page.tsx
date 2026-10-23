"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { VolcanicSummitCathedral } from "@/components/brand/VolcanicSummitCathedral";
import {
  Bookmark,
  ListMusic,
  History,
  Play,
  Pause,
  ChevronRight,
  Headphones,
  Clock,
  Heart,
  Flame,
  UserCheck,
  Plus,
  LogIn,
  Compass,
} from "lucide-react";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { useAuth } from "@/context/AuthContext";
import { formatTime } from "@/lib/utils";

export default function ListenerLibraryPage() {
  const { currentUser, openAuthModal } = useAuth();
  const { currentEpisode, isPlaying, togglePlay, playEpisode } = useAudioPlayer();
  const [activeTab, setActiveTab] = useState<"overview" | "saved" | "playlists" | "history">("overview");

  const [savedEpisodes, setSavedEpisodes] = useState<any[]>([]);
  const [listeningProgress, setListeningProgress] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setSavedEpisodes([]);
      setListeningProgress([]);
      setPlaylists([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetch("/api/library")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) {
          setSavedEpisodes(data.savedEpisodes || []);
          setListeningProgress(data.listeningProgress || []);
          setPlaylists(data.playlists || []);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [currentUser]);

  const handlePlayEpisode = (e: React.MouseEvent, episode: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentEpisode?.id === episode.id) {
      togglePlay();
    } else {
      playEpisode(episode);
    }
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistTitle.trim()) return;

    try {
      const res = await fetch("/api/library/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newPlaylistTitle.trim() }),
      });
      const data = await res.json();
      if (data?.success && data?.playlist) {
        setPlaylists([data.playlist, ...playlists]);
        setNewPlaylistTitle("");
        setIsCreatingPlaylist(false);
      }
    } catch {}
  };

  return (
    <div className="px-4 md:px-8 py-6 space-y-8 pb-16">
      {/* 1. LIBRARY HERO OVERVIEW BANNER */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 border border-[#ff4500]/25 bg-gradient-to-r from-[#17100e] via-[#120f12] to-[#0d0b0e] shadow-xl">
        <VolcanicSummitCathedral intensity="medium" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0b0e] via-[#0d0b0e]/85 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Your <span className="text-[#ff4500]">Library</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#a5a6af] mt-1 font-sans">
              Your saved episodes, playlists, and listening journey — all in one place.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="px-3.5 py-1.5 rounded-full bg-[#1b191e]/80 border border-[#2b2a30] flex items-center gap-2">
              <Bookmark className="w-3.5 h-3.5 text-[#ff4500]" />
              <span className="text-xs font-mono text-[#d0cfd6]">
                <strong className="text-white font-bold">{savedEpisodes.length}</strong> Saved
              </span>
            </div>

            <div className="px-3.5 py-1.5 rounded-full bg-[#1b191e]/80 border border-[#2b2a30] flex items-center gap-2">
              <ListMusic className="w-3.5 h-3.5 text-[#ffb13b]" />
              <span className="text-xs font-mono text-[#d0cfd6]">
                <strong className="text-white font-bold">{playlists.length}</strong> Playlists
              </span>
            </div>

            <div className="px-3.5 py-1.5 rounded-full bg-[#1b191e]/80 border border-[#2b2a30] flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-[#a5a6af]" />
              <span className="text-xs font-mono text-[#d0cfd6]">
                <strong className="text-white font-bold">{listeningProgress.length}</strong> Streamed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* UN卷AUTHENTICATED GUEST CALLOUT */}
      {!currentUser ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#161318] to-[#0f0e11] border border-[#ff4500]/30 text-center max-w-2xl mx-auto space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#ff4500]/15 border border-[#ff4500]/30 flex items-center justify-center mx-auto text-[#ff4500]">
            <Bookmark className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-white">
              Your Personal Faith Audio Vault
            </h2>
            <p className="text-xs sm:text-sm text-[#a5a6af] leading-relaxed max-w-md mx-auto">
              Sign in to save your favorite teachings, resume playback right where you left off across devices, and curate custom playlists.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() =>
                openAuthModal({
                  title: "Unlock Your Library",
                  description: "Sign in or register to bookmark episodes, resume progress, and curate playlists.",
                })
              }
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-[#ff4500] to-[#e63900] text-white font-heading font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_20px_rgba(255,69,0,0.6)] transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Create Account</span>
            </button>

            <Link
              href="/browse"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#1b1a1f] hover:bg-[#25242b] border border-[#2d2c33] text-white font-heading font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4 text-[#ffb13b]" />
              <span>Browse Public Shows</span>
            </Link>
          </div>
        </div>
      ) : (
        /* AUTHENTICATED LISTENER CONTENT */
        <div className="space-y-10">
          {/* TAB BUTTONS */}
          <div className="flex items-center gap-2 border-b border-[#222125] pb-2">
            {(["overview", "saved", "playlists", "history"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? "bg-[#ff4500] text-white shadow-[0_0_15px_rgba(255,69,0,0.4)]"
                    : "text-[#a5a6af] hover:text-white hover:bg-[#18171b]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* SECTION A: SAVED EPISODES */}
          {(activeTab === "overview" || activeTab === "saved") && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-[#ff4500]" />
                  Saved Episodes ({savedEpisodes.length})
                </h2>
              </div>

              {savedEpisodes.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#121113]/80 border border-[#222125] text-center space-y-2">
                  <Bookmark className="w-6 h-6 text-[#a5a6af] mx-auto opacity-70" />
                  <p className="font-heading text-sm font-semibold text-white">No saved episodes yet</p>
                  <p className="text-xs text-[#a5a6af] max-w-sm mx-auto">
                    Click the bookmark or heart icon on any episode to keep it in your study vault.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {savedEpisodes.map((ep) => {
                    const isPlayingThis = isPlaying && currentEpisode?.id === ep.id;
                    return (
                      <div
                        key={ep.id}
                        className="group flex flex-col cursor-pointer"
                        onClick={(e) => handlePlayEpisode(e, ep)}
                      >
                        <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-2 border border-[#222125] bg-[#141315] shadow-lg group-hover:border-[#ff4500]/50 transition-all">
                          <Image
                            src={ep.artworkUrl}
                            alt={ep.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                          <button
                            onClick={(e) => handlePlayEpisode(e, ep)}
                            className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-[#f5a623] hover:bg-[#ffb13b] text-black flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                            aria-label={`Play ${ep.title}`}
                          >
                            {isPlayingThis ? (
                              <Pause className="w-4 h-4 fill-current" />
                            ) : (
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            )}
                          </button>
                        </div>
                        <h3 className="font-heading text-xs font-bold text-white group-hover:text-[#ffb13b] transition-colors truncate">
                          {ep.title}
                        </h3>
                        <p className="text-[10px] text-[#a5a6af] truncate">{ep.seriesTitle}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* SECTION B: PLAYLISTS */}
          {(activeTab === "overview" || activeTab === "playlists") && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                  <ListMusic className="w-4 h-4 text-[#ffb13b]" />
                  Your Playlists ({playlists.length})
                </h2>
                <button
                  onClick={() => setIsCreatingPlaylist(!isCreatingPlaylist)}
                  className="px-3 py-1.5 rounded-full bg-[#ff4500] hover:bg-[#e63900] text-black font-heading font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Playlist</span>
                </button>
              </div>

              {isCreatingPlaylist && (
                <form
                  onSubmit={handleCreatePlaylist}
                  className="p-4 rounded-2xl bg-[#161519] border border-[#ff4500]/30 flex items-center gap-3"
                >
                  <input
                    type="text"
                    value={newPlaylistTitle}
                    onChange={(e) => setNewPlaylistTitle(e.target.value)}
                    placeholder="Enter playlist name (e.g. Morning Prayer, Sermon Prep)..."
                    className="flex-1 bg-[#100f12] border border-[#2a292f] rounded-xl px-4 py-2 text-xs text-white placeholder-[#6e6f77] outline-none focus:border-[#ff4500]"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#ff4500] text-white font-heading text-xs font-bold hover:bg-[#e63900]"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingPlaylist(false)}
                    className="px-3 py-2 text-xs text-[#a5a6af] hover:text-white"
                  >
                    Cancel
                  </button>
                </form>
              )}

              {playlists.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#121113]/80 border border-[#222125] text-center space-y-2">
                  <ListMusic className="w-6 h-6 text-[#a5a6af] mx-auto opacity-70" />
                  <p className="font-heading text-sm font-semibold text-white">No playlists yet</p>
                  <p className="text-xs text-[#a5a6af]">
                    Create custom playlists to group teachings and topical discussions.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {playlists.map((pl) => (
                    <div
                      key={pl.id}
                      className="p-3.5 rounded-2xl bg-gradient-to-b from-[#18161a] to-[#111013] border border-[#262429] hover:border-[#ff4500]/50 transition-all flex flex-col items-center justify-center text-center gap-2 group cursor-pointer"
                    >
                      <div className="p-3 rounded-full bg-[#ffb13b]/10 text-[#ffb13b] group-hover:text-[#ff4500] group-hover:bg-[#ff4500]/10 transition-colors">
                        <ListMusic className="w-5 h-5" />
                      </div>
                      <span className="font-heading text-xs font-bold text-white group-hover:text-[#ffb13b] transition-colors truncate max-w-full">
                        {pl.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* SECTION C: LISTENING HISTORY */}
          {(activeTab === "overview" || activeTab === "history") && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-[#a5a6af]" />
                  Listening History & Resumes ({listeningProgress.length})
                </h2>
              </div>

              {listeningProgress.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#121113]/80 border border-[#222125] text-center space-y-2">
                  <History className="w-6 h-6 text-[#a5a6af] mx-auto opacity-70" />
                  <p className="font-heading text-sm font-semibold text-white">No listening history yet</p>
                  <p className="text-xs text-[#a5a6af]">
                    Episodes you stream will be remembered here so you can pick up where you left off.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl bg-[#111013] border border-[#222125] overflow-hidden shadow-md">
                  <div className="grid grid-cols-12 px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider text-[#6e6f77] border-b border-[#201f23]">
                    <div className="col-span-6">Episode</div>
                    <div className="col-span-3">Show</div>
                    <div className="col-span-3 text-right">Progress</div>
                  </div>

                  <div className="divide-y divide-[#1e1d21]">
                    {listeningProgress.map((item) => {
                      const ep = item.episode;
                      if (!ep) return null;
                      const isPlayingThis = isPlaying && currentEpisode?.id === ep.id;
                      const progressPct = ep.audioDurationSeconds
                        ? Math.min(100, Math.round((item.progressSeconds / ep.audioDurationSeconds) * 100))
                        : 0;

                      return (
                        <div
                          key={ep.id}
                          className="grid grid-cols-12 px-4 py-3 items-center hover:bg-[#161518] transition-colors group cursor-pointer"
                          onClick={(e) => handlePlayEpisode(e, ep)}
                        >
                          <div className="col-span-6 flex items-center gap-3 min-w-0 pr-2">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[#2a292f]">
                              <Image
                                src={ep.artworkUrl}
                                alt={ep.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <button
                              onClick={(e) => handlePlayEpisode(e, ep)}
                              className="w-6 h-6 rounded-full bg-[#f5a623] hover:bg-[#ffb13b] text-black flex items-center justify-center shrink-0 shadow-sm"
                              aria-label={`Play ${ep.title}`}
                            >
                              {isPlayingThis ? (
                                <Pause className="w-3 h-3 fill-current" />
                              ) : (
                                <Play className="w-3 h-3 fill-current ml-0.5" />
                              )}
                            </button>
                            <span className="font-heading text-xs font-semibold text-white group-hover:text-[#ffb13b] transition-colors truncate">
                              {ep.title}
                            </span>
                          </div>

                          <div className="col-span-3 text-xs text-[#a5a6af] truncate">
                            {ep.seriesTitle}
                          </div>

                          <div className="col-span-3 text-right text-[11px] font-mono text-[#a5a6af]">
                            {item.completed ? (
                              <span className="text-emerald-400">Completed</span>
                            ) : (
                              <span>{formatTime(item.progressSeconds)} ({progressPct}%)</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
