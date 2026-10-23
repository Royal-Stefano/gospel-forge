"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldAlert,
  Rss,
  Radio,
  Users,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Play,
  FileText,
  Clock,
  Layers,
  ChevronRight,
} from "lucide-react";
import { EPISODES, SERIES_LIST, COMMUNITY_POSTS } from "@/data/mockData";
import { formatTime, formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "episodes" | "sync" | "moderation"
  >("overview");

  const handleManualRssSync = () => {
    setIsSyncing(true);
    setSyncMessage(null);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncMessage("RSS Feed successfully synchronized. 6 episodes verified.");
    }, 1500);
  };

  return (
    <div className="px-4 md:px-8 py-6 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222123]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#8f1609]/20 text-[#ff4500] border border-[#8f1609]/40">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
              Forge Control Room
            </h1>
            <p className="text-xs sm:text-sm text-[#a5a6af]">
              Administration, podcast publishing, RSS ingest, and moderation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleManualRssSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1c1b1b] hover:bg-[#262527] border border-[#ff4500]/40 text-xs font-mono text-white transition-all disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#ff4500] ${
                isSyncing ? "animate-spin" : ""
              }`}
            />
            <span>{isSyncing ? "Syncing..." : "Sync RSS Now"}</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[#222123] pb-2 text-sm font-semibold">
        {[
          { id: "overview", label: "Overview" },
          { id: "episodes", label: "Episode Management" },
          { id: "sync", label: "RSS Feed & Storage" },
          { id: "moderation", label: "Community Moderation" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-2 relative transition-colors ${
              activeTab === tab.id
                ? "text-[#ff4500] font-bold"
                : "text-[#a5a6af] hover:text-white"
            }`}
          >
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <span className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-[#ff4500]" />
            )}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#121113] border border-[#222123] space-y-1">
              <span className="text-[11px] font-mono uppercase text-[#6e6f77]">
                Total Streams
              </span>
              <p className="text-2xl font-bold font-mono text-white">49,810</p>
              <span className="text-[10px] text-emerald-400 font-mono">
                +14.2% this week
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#121113] border border-[#222123] space-y-1">
              <span className="text-[11px] font-mono uppercase text-[#6e6f77]">
                Live Listeners
              </span>
              <p className="text-2xl font-bold font-mono text-[#ffb13b]">142</p>
              <span className="text-[10px] text-[#a5a6af] font-mono">
                Active streaming sessions
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#121113] border border-[#222123] space-y-1">
              <span className="text-[11px] font-mono uppercase text-[#6e6f77]">
                RSS Sync Health
              </span>
              <p className="text-2xl font-bold font-mono text-emerald-400">
                100%
              </p>
              <span className="text-[10px] text-[#a5a6af] font-mono">
                Last checked 4 min ago
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#121113] border border-[#222123] space-y-1">
              <span className="text-[11px] font-mono uppercase text-[#6e6f77]">
                Cloud Hostinger Ready
              </span>
              <p className="text-2xl font-bold font-mono text-[#ff4500]">
                Node.js v24
              </p>
              <span className="text-[10px] text-[#a5a6af] font-mono">
                Production configured
              </span>
            </div>
          </div>

          {/* Quick Recent Episodes Table */}
          <div className="p-6 rounded-2xl bg-[#121113] border border-[#222123] space-y-4">
            <h3 className="font-heading text-lg font-bold text-white">
              Recently Synchronized Episodes
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-[#222123] text-[#6e6f77] uppercase">
                  <tr>
                    <th className="pb-3">Title</th>
                    <th className="pb-3">Series</th>
                    <th className="pb-3">Duration</th>
                    <th className="pb-3">Plays</th>
                    <th className="pb-3">Published</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c1b1b]">
                  {EPISODES.map((ep) => (
                    <tr key={ep.id} className="hover:bg-[#181719]/60">
                      <td className="py-3 font-medium text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#ff4500]" />
                        {ep.title}
                      </td>
                      <td className="py-3 text-[#ffb13b]">{ep.seriesTitle}</td>
                      <td className="py-3 text-[#a5a6af]">
                        {formatTime(ep.durationSeconds)}
                      </td>
                      <td className="py-3 text-white">
                        {ep.playCount.toLocaleString()}
                      </td>
                      <td className="py-3 text-[#a5a6af]">
                        {formatDate(ep.publishedAt)}
                      </td>
                      <td className="py-3 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                          Live
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EPISODES TAB */}
      {activeTab === "episodes" && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#a5a6af] font-mono">
              Managing {EPISODES.length} episodes
            </span>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ff4500] text-black text-xs font-bold font-heading">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Episode Override</span>
            </button>
          </div>

          <div className="space-y-3">
            {EPISODES.map((ep) => (
              <div
                key={ep.id}
                className="p-4 rounded-xl bg-[#121113] border border-[#222123] flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-[#2a2929]">
                    <Image
                      src={ep.artworkUrl}
                      alt={ep.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{ep.title}</h4>
                    <p className="text-xs text-[#a5a6af]">{ep.seriesTitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 rounded-lg bg-[#1c1b1b] text-xs font-mono text-[#ffb13b] border border-[#2a2929]">
                    Edit Metadata
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SYNC TAB */}
      {activeTab === "sync" && (
        <div className="p-6 rounded-2xl bg-[#121113] border border-[#222123] space-y-4 animate-in fade-in">
          <h3 className="font-heading text-lg font-bold text-white">
            Automated RSS Synchronizer Engine
          </h3>
          <p className="text-xs sm:text-sm text-[#a5a6af]">
            Gospel Forge reads your upstream podcast host RSS feed, validates GUIDs,
            extracts audio enclosures, and synchronizes episode metadata into
            PostgreSQL every 15 minutes.
          </p>

          <div className="p-4 rounded-xl bg-[#181719] border border-[#262527] space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[#6e6f77]">Feed URL:</span>
              <span className="text-[#ffb13b]">
                https://anchor.fm/s/gospel-forge/podcast/rss
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6e6f77]">Scheduled Cron:</span>
              <span className="text-white">*/15 * * * * (Every 15 minutes)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6e6f77]">Sync Engine:</span>
              <span className="text-emerald-400">GitHub Actions / Webhook</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6e6f77]">Audio Storage Rule:</span>
              <span className="text-[#a5a6af]">
                Zero duplicate MP3 files stored locally (Direct CDN Enclosures)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODERATION TAB */}
      {activeTab === "moderation" && (
        <div className="p-6 rounded-2xl bg-[#121113] border border-[#222123] space-y-4 animate-in fade-in">
          <h3 className="font-heading text-lg font-bold text-white">
            Community Reports & Moderation
          </h3>
          <p className="text-xs text-[#a5a6af]">
            All community conversations, replies, and comments are monitored for sound fellowship.
          </p>
          <div className="p-6 text-center rounded-xl bg-[#181719] border border-[#262527]">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm text-white font-medium">Clean Moderation Queue</p>
            <p className="text-xs text-[#6e6f77] mt-1">
              There are currently 0 flagged reports or spam comments.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
