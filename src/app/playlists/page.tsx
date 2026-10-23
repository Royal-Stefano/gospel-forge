"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ListMusic, Plus, Compass } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function PlaylistsPage() {
  const { currentUser, openAuthModal } = useAuth();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    if (!currentUser) return;

    fetch("/api/library/playlists")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.playlists) {
          setPlaylists(data.playlists);
        }
      })
      .catch(() => {});
  }, [currentUser]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch("/api/library/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      const data = await res.json();
      if (data?.success && data?.playlist) {
        setPlaylists([data.playlist, ...playlists]);
        setNewTitle("");
        setIsCreating(false);
      }
    } catch {}
  };

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

        {currentUser && (
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff4500] text-black font-heading font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_15px_rgba(255,69,0,0.5)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Playlist</span>
          </button>
        )}
      </div>

      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="p-4 rounded-2xl bg-[#161519] border border-[#ff4500]/30 flex items-center gap-3 max-w-xl"
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Playlist title (e.g. Morning Devotions)..."
            className="flex-1 bg-[#100f12] border border-[#2a292f] rounded-xl px-4 py-2 text-xs text-white placeholder-[#6e6f77] outline-none focus:border-[#ff4500]"
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#ff4500] text-white font-heading text-xs font-bold hover:bg-[#e63900]"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => setIsCreating(false)}
            className="px-3 py-2 text-xs text-[#a5a6af] hover:text-white"
          >
            Cancel
          </button>
        </form>
      )}

      {!currentUser ? (
        <div className="p-10 rounded-3xl bg-[#121113] border border-[#222123] text-center max-w-md mx-auto space-y-4">
          <ListMusic className="w-8 h-8 text-[#ffb13b] mx-auto opacity-80" />
          <h3 className="font-heading text-lg font-bold text-white">Sign In to Create Playlists</h3>
          <p className="text-xs text-[#a5a6af]">
            Organize sound doctrine, sermons, and worship tracks into your own custom playlists.
          </p>
          <button
            onClick={() => openAuthModal({ title: "Custom Playlists", description: "Sign in to curate and save your own playlists." })}
            className="px-6 py-2.5 rounded-full bg-[#ff4500] text-black font-heading font-bold text-xs uppercase tracking-wider hover:bg-[#e63900] transition-colors"
          >
            Sign In
          </button>
        </div>
      ) : playlists.length === 0 ? (
        <div className="p-10 rounded-3xl bg-[#121113] border border-[#222123] text-center max-w-md mx-auto space-y-4">
          <ListMusic className="w-8 h-8 text-[#6e6f77] mx-auto opacity-60" />
          <h3 className="font-heading text-lg font-bold text-white">No Playlists Created</h3>
          <p className="text-xs text-[#a5a6af]">
            You have not created any custom playlists yet. Click &quot;New Playlist&quot; above to start curating.
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="p-5 rounded-2xl bg-[#121113] hover:bg-[#1a191b] border border-[#222123] hover:border-[#ff4500]/40 transition-all flex items-center gap-4 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-xl bg-[#ffb13b]/10 text-[#ffb13b] flex items-center justify-center shrink-0 border border-[#ffb13b]/20">
                <ListMusic className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-white group-hover:text-[#ffb13b] transition-colors truncate">
                  {playlist.title}
                </h3>
                <p className="text-xs text-[#a5a6af] line-clamp-1 mt-0.5 font-body">
                  {playlist.description || "Custom Playlist"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
