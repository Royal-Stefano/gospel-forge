"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Radio,
  PlusCircle,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Archive,
  Trash2,
  Edit3,
  ExternalLink,
  Flame,
} from "lucide-react";
import { usePodcastStore } from "@/context/PodcastStoreContext";
import { useAuth } from "@/context/AuthContext";
import type { PublicationStatus } from "@/types";
import { formatTime, formatDate, cn } from "@/lib/utils";

export default function StudioEpisodesManager() {
  const { episodes, publishEpisode, archiveEpisode, deleteEpisode } =
    usePodcastStore();
  const { currentUser, canPublish } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const filteredEpisodes = useMemo(() => {
    return episodes.filter((ep) => {
      const status = ep.status || "published";
      const matchesStatus =
        selectedStatus === "all" || status === selectedStatus;
      const matchesQuery =
        searchQuery === "" ||
        ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.seriesTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.speaker.name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesQuery;
    });
  }, [episodes, selectedStatus, searchQuery]);

  const handlePublish = async (id: string, title: string) => {
    const res = await publishEpisode(id);
    if (res.success) {
      setActionFeedback(`"${title}" is now published to the public website.`);
    } else {
      alert(res.error || "Failed to publish.");
    }
  };

  const handleArchive = async (id: string) => {
    const res = await archiveEpisode(id);
    if (res.success) {
      setActionFeedback("Episode archived.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this episode?")) {
      await deleteEpisode(id);
      setActionFeedback("Episode deleted.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-white tracking-wide">
            Episodes Catalog
          </h1>
          <p className="text-sm text-[#a5a6af] mt-1">
            Manage lifecycle, releases, and audio recordings across all shows.
          </p>
        </div>

        <Link
          href="/studio/episodes/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#ff4500] to-[#ffb13b] text-black font-heading font-bold text-xs uppercase tracking-wider shadow-lg"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Upload Episode</span>
        </Link>
      </div>

      {actionFeedback && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-mono flex items-center justify-between animate-in fade-in">
          <span>{actionFeedback}</span>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-emerald-400 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#111113] border border-[#222123] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "All Episodes" },
            { id: "published", label: "Published" },
            { id: "draft", label: "Drafts" },
            { id: "scheduled", label: "Scheduled" },
            { id: "archived", label: "Archived" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedStatus(item.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-colors whitespace-nowrap",
                selectedStatus === item.id
                  ? "bg-[#ff4500] text-black font-bold shadow-[0_0_10px_rgba(255,69,0,0.4)]"
                  : "bg-[#181719] text-[#a5a6af] hover:text-white border border-[#262527]"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 w-4 h-4 text-[#6e6f77]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, show, speaker..."
            className="w-full bg-[#181719] text-xs text-white placeholder-[#6e6f77] pl-9 pr-3 py-2 rounded-xl border border-[#262527] focus:border-[#ff4500] focus:outline-none"
          />
        </div>
      </div>

      {/* Episodes Table */}
      <div className="p-6 rounded-3xl bg-[#111113] border border-[#222123] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-[#222123] text-[#6e6f77] uppercase">
              <tr>
                <th className="pb-3">Episode & Series</th>
                <th className="pb-3">Speaker</th>
                <th className="pb-3">Duration</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Published / Created</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181719]">
              {filteredEpisodes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#6e6f77]">
                    No episodes found matching this filter.
                  </td>
                </tr>
              ) : (
                filteredEpisodes.map((ep) => {
                  const status = ep.status || "published";
                  return (
                    <tr key={ep.id} className="hover:bg-[#161517]/80">
                      <td className="py-3 pr-2">
                        <div className="flex items-center gap-3">
                          <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-[#2a2929]">
                            <Image
                              src={ep.artworkUrl}
                              alt={ep.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate max-w-sm">
                              {ep.title}
                            </p>
                            <span className="text-[10px] text-[#ffb13b] truncate block">
                              {ep.seriesTitle} • Ep {ep.episodeNumber || 1}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 text-[#a5a6af]">{ep.speaker.name}</td>

                      <td className="py-3 text-[#a5a6af]">
                        {formatTime(ep.durationSeconds)}
                      </td>

                      <td className="py-3">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                            status === "published"
                              ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30"
                              : status === "draft"
                              ? "bg-amber-950/80 text-amber-300 border border-amber-500/30"
                              : status === "scheduled"
                              ? "bg-blue-950/80 text-blue-300 border border-blue-500/30"
                              : "bg-gray-800 text-gray-400"
                          )}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="py-3 text-[#6e6f77]">
                        {formatDate(ep.publishedAt || ep.createdAt || "")}
                      </td>

                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {status === "draft" && canPublish && (
                            <button
                              onClick={() => handlePublish(ep.id, ep.title)}
                              className="px-2.5 py-1 rounded-md bg-[#ff4500] hover:bg-[#ff5500] text-black font-bold text-[10px] transition-colors"
                              title="Publish Episode Now"
                            >
                              Publish
                            </button>
                          )}

                          {status === "published" && (
                            <Link
                              href={`/episodes/${ep.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-md bg-[#181719] hover:bg-[#222123] text-[#a5a6af] hover:text-white transition-colors"
                              title="View Public Page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          <Link
                            href={`/studio/episodes/${ep.id}/edit`}
                            className="p-1.5 rounded-md bg-[#181719] hover:bg-[#222123] text-[#ffb13b] transition-colors"
                            title="Edit Episode"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Link>

                          {status !== "archived" && canPublish && (
                            <button
                              onClick={() => handleArchive(ep.id)}
                              className="p-1.5 rounded-md bg-[#181719] hover:bg-[#222123] text-[#6e6f77] hover:text-white transition-colors"
                              title="Archive Episode"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {currentUser?.role === "super_admin" && (
                            <button
                              onClick={() => handleDelete(ep.id)}
                              className="p-1.5 rounded-md bg-[#181719] hover:bg-red-950/60 text-[#6e6f77] hover:text-red-400 transition-colors"
                              title="Permanently Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
