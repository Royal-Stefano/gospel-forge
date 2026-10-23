"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Radio,
  PlusCircle,
  FileEdit,
  Calendar,
  Users,
  HardDrive,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Flame,
} from "lucide-react";
import { usePodcastStore } from "@/context/PodcastStoreContext";
import { useAuth } from "@/context/AuthContext";
import { formatTime, formatDate, cn } from "@/lib/utils";

export default function StudioDashboardOverview() {
  const { episodes, auditLogs, moderationReports } = usePodcastStore();
  const { currentUser, usersList, canPublish } = useAuth();

  const publishedCount = episodes.filter((e) => e.status === "published" || !e.status).length;
  const draftCount = episodes.filter((e) => e.status === "draft").length;
  const scheduledCount = episodes.filter((e) => e.status === "scheduled").length;
  const pendingReportsCount = moderationReports.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#170e0b] via-[#121113] to-[#0c0b0c] border border-[#ff4500]/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff4500]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff4500]/15 border border-[#ff4500]/30 text-[#ffb13b] text-xs font-mono font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-[#ff4500] animate-pulse" />
            <span>Forge Studio Control</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {currentUser?.displayName}
          </h1>
          <p className="text-xs sm:text-sm text-[#a5a6af] font-body max-w-xl">
            You are operating with{" "}
            <span className="text-white font-semibold capitalize">
              {currentUser?.role.replace("_", " ")}
            </span>{" "}
            privileges. All production uploads, scheduling, and catalog releases
            are logged to the audit ledger.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            href="/studio/episodes/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-[#ff4500] to-[#ffb13b] text-black font-heading font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,69,0,0.5)] hover:scale-105 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload New Episode</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[#181719] hover:bg-[#201f22] border border-[#2a2929] text-xs font-medium text-white transition-colors"
          >
            <span>Live Streaming</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#a5a6af]" />
          </Link>
        </div>
      </div>

      {/* Real Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Published */}
        <div className="p-5 rounded-2xl bg-[#111113] border border-[#222123] hover:border-[#ff4500]/40 transition-all space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#6e6f77]">
            <span>Published Episodes</span>
            <Radio className="w-4 h-4 text-[#ff4500]" />
          </div>
          <p className="text-3xl font-bold font-mono text-white">{publishedCount}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Live on public website</span>
          </div>
        </div>

        {/* Drafts */}
        <div className="p-5 rounded-2xl bg-[#111113] border border-[#222123] hover:border-[#ff4500]/40 transition-all space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#6e6f77]">
            <span>Draft Episodes</span>
            <FileEdit className="w-4 h-4 text-[#ffb13b]" />
          </div>
          <p className="text-3xl font-bold font-mono text-white">{draftCount}</p>
          <p className="text-[11px] text-[#a5a6af] font-mono">
            Awaiting editor review / publish
          </p>
        </div>

        {/* Scheduled */}
        <div className="p-5 rounded-2xl bg-[#111113] border border-[#222123] hover:border-[#ff4500]/40 transition-all space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#6e6f77]">
            <span>Scheduled Releases</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-bold font-mono text-white">{scheduledCount}</p>
          <p className="text-[11px] text-[#a5a6af] font-mono">
            Auto-publishing at set UTC times
          </p>
        </div>

        {/* Registered Users */}
        <div className="p-5 rounded-2xl bg-[#111113] border border-[#222123] hover:border-[#ff4500]/40 transition-all space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#6e6f77]">
            <span>Platform Accounts</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-bold font-mono text-white">{usersList.length}</p>
          <p className="text-[11px] text-[#a5a6af] font-mono">
            {usersList.filter((u) => u.role !== "listener").length} Staff members
          </p>
        </div>
      </div>

      {/* Secondary Operational Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* RSS Status */}
        <div className="p-5 rounded-2xl bg-[#111113] border border-[#222123] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#6e6f77]">
            <span>Podcast RSS Ingest</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-lg font-bold text-white font-mono">15-Min Sync Active</p>
          <p className="text-xs text-[#a5a6af] font-body">
            GitHub Actions scheduled job verified. Zero MP3 duplicate storage.
          </p>
        </div>

        {/* Object Storage */}
        <div className="p-5 rounded-2xl bg-[#111113] border border-[#222123] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#6e6f77]">
            <span>Media Storage Tier</span>
            <HardDrive className="w-4 h-4 text-[#ffb13b]" />
          </div>
          <p className="text-lg font-bold text-white font-mono">Direct CDN Enclosures</p>
          <p className="text-xs text-[#a5a6af] font-body">
            Signed direct-to-storage uploads; Hostinger disk bypassed for audio.
          </p>
        </div>

        {/* Moderation Queue */}
        <div className="p-5 rounded-2xl bg-[#111113] border border-[#222123] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#6e6f77]">
            <span>Community Queue</span>
            <MessageSquare className="w-4 h-4 text-[#ff4500]" />
          </div>
          <p className="text-lg font-bold text-white font-mono">
            {pendingReportsCount} Pending Reports
          </p>
          <p className="text-xs text-[#a5a6af] font-body">
            Community moderation queue monitored by editors and administrators.
          </p>
        </div>
      </div>

      {/* Two Columns: Recent Episodes Table & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Episodes */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#111113] border border-[#222123] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1f1e20]">
            <div>
              <h3 className="font-heading text-lg font-bold text-white">
                Catalog Episodes
              </h3>
              <p className="text-xs text-[#6e6f77] font-mono">
                Manage status, edit metadata, and publish
              </p>
            </div>
            <Link
              href="/studio/episodes"
              className="text-xs font-mono text-[#ffb13b] hover:underline"
            >
              View All ({episodes.length})
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#222123] text-[#6e6f77] uppercase">
                <tr>
                  <th className="pb-3">Title & Series</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Author</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181719]">
                {episodes.slice(0, 6).map((ep) => (
                  <tr key={ep.id} className="hover:bg-[#161517]/80">
                    <td className="py-3 pr-2">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[#2a2929]">
                          <Image
                            src={ep.artworkUrl}
                            alt={ep.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate max-w-xs">
                            {ep.title}
                          </p>
                          <p className="text-[11px] text-[#ffb13b] truncate">
                            {ep.seriesTitle}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-[#a5a6af]">
                      {formatTime(ep.durationSeconds)}
                    </td>
                    <td className="py-3">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          ep.status === "published" || !ep.status
                            ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30"
                            : ep.status === "draft"
                            ? "bg-amber-950/80 text-amber-300 border border-amber-500/30"
                            : "bg-blue-950/80 text-blue-300 border border-blue-500/30"
                        )}
                      >
                        {ep.status || "published"}
                      </span>
                    </td>
                    <td className="py-3 text-[#a5a6af]">
                      {ep.authorName || ep.speaker.name}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/studio/episodes/${ep.id}/edit`}
                        className="px-2.5 py-1 rounded-md bg-[#1c1b1b] hover:bg-[#252426] text-white border border-[#2a2929] transition-colors"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security & Audit Trail */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[#111113] border border-[#222123] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1f1e20]">
            <ShieldCheck className="w-4 h-4 text-[#ff4500]" />
            <h3 className="font-heading text-lg font-bold text-white">
              Studio Audit Trail
            </h3>
          </div>
          <p className="text-xs text-[#a5a6af]">
            Real-time record of all publication and role assignments.
          </p>

          <div className="space-y-3">
            {auditLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-[#161517] border border-[#222123] text-xs font-mono space-y-1"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[#ffb13b] font-bold">
                    {log.action.replace("_", " ")}
                  </span>
                  <span className="text-[#6e6f77]">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
                <p className="text-white text-[11px] truncate">{log.targetTitle}</p>
                <div className="flex items-center justify-between text-[10px] text-[#6e6f77] pt-1">
                  <span>By: {log.userName}</span>
                  <span className="uppercase text-[#a5a6af] font-semibold">
                    [{log.userRole}]
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
