"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  Headphones,
  Mic,
  Play,
  Download,
  TrendingUp,
  UserPlus,
  UploadCloud,
  Layers,
  LayoutGrid,
  MoreHorizontal,
  Check,
  X,
  Clock,
  MessageSquare,
  Radio,
  BookOpen,
  Sparkles,
  Heart,
  Globe,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePodcastStore } from "@/context/PodcastStoreContext";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { currentUser } = useAuth();
  const { episodes } = usePodcastStore();

  const [timeRange, setTimeRange] = useState("Last 30 Days");
  const [activeApprovalTab, setActiveApprovalTab] = useState<
    "creators" | "episodes" | "comments"
  >("creators");

  // Pending Creators state
  const [pendingCreators, setPendingCreators] = useState([
    {
      id: "app-1",
      name: "Sarah Mitchell",
      role: "Worship Artist",
      time: "2 days ago",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    },
    {
      id: "app-2",
      name: "Daniel Brooks",
      role: "Podcast Creator",
      time: "3 days ago",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    },
    {
      id: "app-3",
      name: "Grace Thomas",
      role: "Music Ministry",
      time: "4 days ago",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
    },
    {
      id: "app-4",
      name: "Michael Chen",
      role: "Speaker",
      time: "5 days ago",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    },
    {
      id: "app-5",
      name: "Emily Carter",
      role: "Podcast Creator",
      time: "5 days ago",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    },
  ]);

  const handleApprove = (id: string) => {
    setPendingCreators((prev) => prev.filter((c) => c.id !== id));
  };

  const handleReject = (id: string) => {
    setPendingCreators((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-[#f5f0ea]">
      {/* ================= 1. WELCOME HERO BANNER ================= */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#141217] via-[#1a141b] to-[#120f14] border border-[#26232b] p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        {/* Background Visual Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen overflow-hidden">
          <Image
            src="/images/hero-volcanic-cross.jpg"
            alt="Volcanic Summit Cross"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0c0f] via-[#0d0c0f]/70 to-transparent" />
        </div>

        {/* Welcome Text */}
        <div className="relative z-10 space-y-1.5 max-w-xl">
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Welcome Back,{" "}
            <span className="bg-gradient-to-r from-[#ff4500] via-[#ff7733] to-[#e63900] bg-clip-text text-transparent">
              Admin
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#a5a6af] font-sans">
            Manage content, creators, and grow the Gospel Forge community.
          </p>
        </div>

        {/* Matthew 28:19 Scripture Callout Card */}
        <div className="relative z-10 max-w-md w-full md:w-auto p-4 rounded-xl bg-[#111014]/90 backdrop-blur-md border border-[#2b2833] space-y-1.5 shadow-xl">
          <div className="flex items-start gap-2">
            <span className="text-2xl text-[#ffb13b] font-serif leading-none shrink-0">
              “
            </span>
            <p className="font-cinzel text-xs text-[#f5f0ea] italic leading-relaxed">
              &quot;Go and make disciples of all nations...&quot;
            </p>
          </div>
          <p className="text-right text-[10px] font-mono font-bold text-[#ffb13b]">
            Matthew 28:19 (NIV)
          </p>
        </div>
      </div>

      {/* ================= 2. FIVE KEY METRIC CARDS ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Metric 1: Total Users */}
        <div className="p-4 rounded-2xl bg-[#111013] border border-[#222026] space-y-2 hover:border-[#ff4500]/40 transition-colors">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-0.5">
              ↑ 18%
            </span>
          </div>
          <div>
            <span className="text-[11px] text-[#8e8d94] block">Total Users</span>
            <p className="font-heading text-xl sm:text-2xl font-black text-white">
              12,580
            </p>
          </div>
          {/* Blue Sparkline */}
          <svg className="w-full h-6 overflow-visible" viewBox="0 0 100 24">
            <path
              d="M0,18 Q20,20 40,12 T80,8 T100,2"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Metric 2: Active Listeners */}
        <div className="p-4 rounded-2xl bg-[#111013] border border-[#222026] space-y-2 hover:border-[#ff4500]/40 transition-colors">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-amber-500/10 text-[#ffb13b]">
              <Headphones className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-0.5">
              ↑ 24%
            </span>
          </div>
          <div>
            <span className="text-[11px] text-[#8e8d94] block">Active Listeners</span>
            <p className="font-heading text-xl sm:text-2xl font-black text-white">
              8,240
            </p>
          </div>
          {/* Yellow Sparkline */}
          <svg className="w-full h-6 overflow-visible" viewBox="0 0 100 24">
            <path
              d="M0,20 Q25,22 50,14 T80,10 T100,4"
              fill="none"
              stroke="#ffb13b"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Metric 3: Verified Creators */}
        <div className="p-4 rounded-2xl bg-[#111013] border border-[#222026] space-y-2 hover:border-[#ff4500]/40 transition-colors">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-red-500/10 text-[#ff4500]">
              <Mic className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-0.5">
              ↑ 12%
            </span>
          </div>
          <div>
            <span className="text-[11px] text-[#8e8d94] block">Verified Creators</span>
            <p className="font-heading text-xl sm:text-2xl font-black text-white">
              340
            </p>
          </div>
          {/* Red Sparkline */}
          <svg className="w-full h-6 overflow-visible" viewBox="0 0 100 24">
            <path
              d="M0,22 Q30,20 60,15 T85,8 T100,3"
              fill="none"
              stroke="#ff4500"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Metric 4: Total Episodes */}
        <div className="p-4 rounded-2xl bg-[#111013] border border-[#222026] space-y-2 hover:border-[#ff4500]/40 transition-colors">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Play className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-0.5">
              ↑ 31%
            </span>
          </div>
          <div>
            <span className="text-[11px] text-[#8e8d94] block">Total Episodes</span>
            <p className="font-heading text-xl sm:text-2xl font-black text-white">
              1,250
            </p>
          </div>
          {/* Green Sparkline */}
          <svg className="w-full h-6 overflow-visible" viewBox="0 0 100 24">
            <path
              d="M0,19 Q25,18 55,10 T85,5 T100,2"
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Metric 5: Total Downloads */}
        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-[#111013] border border-[#222026] space-y-2 hover:border-[#ff4500]/40 transition-colors">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Download className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-0.5">
              ↑ 28%
            </span>
          </div>
          <div>
            <span className="text-[11px] text-[#8e8d94] block">Total Downloads</span>
            <p className="font-heading text-xl sm:text-2xl font-black text-white">
              48,320
            </p>
          </div>
          {/* Cyan Sparkline */}
          <svg className="w-full h-6 overflow-visible" viewBox="0 0 100 24">
            <path
              d="M0,21 Q30,19 60,11 T85,6 T100,2"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* ================= 3. MIDDLE ROW: PLATFORM GROWTH, DEMOGRAPHICS & QUICK ACTIONS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Platform Growth Chart (6 cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[#111013] border border-[#222026] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              Platform Growth
            </h3>
            <button className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#18171b] border border-[#2a2832] text-xs text-[#a5a6af] hover:text-white transition-colors">
              <span>{timeRange}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Chart Canvas */}
            <div className="flex-1 h-52 relative">
              <svg className="w-full h-full" viewBox="0 0 450 180">
                {/* Horizontal grid lines */}
                {[0, 45, 90, 135, 180].map((y, idx) => (
                  <line
                    key={idx}
                    x1="30"
                    y1={y}
                    x2="450"
                    y2={y}
                    stroke="#1c1a20"
                    strokeDasharray="4"
                  />
                ))}

                {/* Y-Axis Labels */}
                <text x="5" y="10" fill="#6e6f77" fontSize="10">8K</text>
                <text x="5" y="55" fill="#6e6f77" fontSize="10">6K</text>
                <text x="5" y="100" fill="#6e6f77" fontSize="10">4K</text>
                <text x="5" y="145" fill="#6e6f77" fontSize="10">2K</text>
                <text x="5" y="180" fill="#6e6f77" fontSize="10">0</text>

                {/* Spline 1: Users (Orange) */}
                <path
                  d="M 30,160 Q 90,140 150,130 T 270,110 T 360,65 T 450,40"
                  fill="none"
                  stroke="#ff4500"
                  strokeWidth="3"
                />

                {/* Spline 2: Episodes (Yellow) */}
                <path
                  d="M 30,170 Q 90,155 150,150 T 270,130 T 360,115 T 450,95"
                  fill="none"
                  stroke="#ffb13b"
                  strokeWidth="2.5"
                />

                {/* Spline 3: Downloads (Blue) */}
                <path
                  d="M 30,175 Q 90,170 150,165 T 270,155 T 360,140 T 450,120"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
              </svg>

              {/* X-Axis Dates */}
              <div className="flex justify-between pl-8 pt-2 text-[10px] text-[#6e6f77] font-mono">
                <span>Sep 25</span>
                <span>Sep 30</span>
                <span>Oct 5</span>
                <span>Oct 10</span>
                <span>Oct 15</span>
                <span>Oct 20</span>
                <span>Oct 25</span>
              </div>
            </div>

            {/* Legend on right */}
            <div className="space-y-2 text-xs font-medium shrink-0 pr-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 bg-[#ff4500] rounded-full" />
                <span className="text-white">Users</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 bg-[#ffb13b] rounded-full" />
                <span className="text-white">Episodes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 bg-[#3b82f6] rounded-full" />
                <span className="text-white">Downloads</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: User Demographics Donut (3 cols) */}
        <div className="lg:col-span-3 p-5 rounded-2xl bg-[#111013] border border-[#222026] space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
            User Demographics
          </h3>

          <div className="flex flex-col items-center justify-center">
            {/* SVG Donut */}
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#1c1b20"
                  strokeWidth="14"
                />
                {/* India (42%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#ff4500"
                  strokeWidth="14"
                  strokeDasharray="100 238"
                  strokeDashoffset="0"
                />
                {/* USA (18%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#ffb13b"
                  strokeWidth="14"
                  strokeDasharray="43 238"
                  strokeDashoffset="-100"
                />
                {/* UK (12%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#ff7733"
                  strokeWidth="14"
                  strokeDasharray="28 238"
                  strokeDashoffset="-143"
                />
                {/* Canada (8%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth="14"
                  strokeDasharray="19 238"
                  strokeDashoffset="-171"
                />
                {/* Australia (6%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#8b5cf6"
                  strokeWidth="14"
                  strokeDasharray="14 238"
                  strokeDashoffset="-190"
                />
                {/* Others (14%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#64748b"
                  strokeWidth="14"
                  strokeDasharray="33 238"
                  strokeDashoffset="-204"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-heading text-sm font-black text-white">
                  12,580
                </span>
                <span className="text-[9px] text-[#8e8d94]">Total Users</span>
              </div>
            </div>

            {/* Demographics Legend */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-4 text-[11px] w-full">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#a5a6af]">
                  <span className="w-2 h-2 rounded-full bg-[#ff4500]" />
                  India
                </span>
                <span className="text-white font-mono font-bold">42%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#a5a6af]">
                  <span className="w-2 h-2 rounded-full bg-[#ffb13b]" />
                  United States
                </span>
                <span className="text-white font-mono font-bold">18%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#a5a6af]">
                  <span className="w-2 h-2 rounded-full bg-[#ff7733]" />
                  United Kingdom
                </span>
                <span className="text-white font-mono font-bold">12%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#a5a6af]">
                  <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                  Canada
                </span>
                <span className="text-white font-mono font-bold">8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#a5a6af]">
                  <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
                  Australia
                </span>
                <span className="text-white font-mono font-bold">6%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#a5a6af]">
                  <span className="w-2 h-2 rounded-full bg-[#64748b]" />
                  Others
                </span>
                <span className="text-white font-mono font-bold">14%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Quick Actions (3 cols) */}
        <div className="lg:col-span-3 p-5 rounded-2xl bg-[#111013] border border-[#222026] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              Quick Actions
            </h3>
            <ArrowRight className="w-3.5 h-3.5 text-[#6e6f77]" />
          </div>

          <div className="space-y-2.5">
            <Link
              href="/admin/users"
              className="flex items-center gap-3 p-3 rounded-xl bg-[#17161a] hover:bg-[#201e25] border border-[#25232c] text-xs font-semibold text-white transition-all group"
            >
              <div className="p-2 rounded-lg bg-[#222028] group-hover:bg-[#ff4500]/20 text-[#a5a6af] group-hover:text-[#ff4500] transition-colors">
                <UserPlus className="w-4 h-4" />
              </div>
              <span>Add New Creator</span>
            </Link>

            <Link
              href="/studio/episodes/new"
              className="flex items-center gap-3 p-3 rounded-xl bg-[#17161a] hover:bg-[#201e25] border border-[#25232c] text-xs font-semibold text-white transition-all group"
            >
              <div className="p-2 rounded-lg bg-[#222028] group-hover:bg-[#ff4500]/20 text-[#a5a6af] group-hover:text-[#ff4500] transition-colors">
                <UploadCloud className="w-4 h-4" />
              </div>
              <span>Upload Episode</span>
            </Link>

            <Link
              href="/studio/series"
              className="flex items-center gap-3 p-3 rounded-xl bg-[#17161a] hover:bg-[#201e25] border border-[#25232c] text-xs font-semibold text-white transition-all group"
            >
              <div className="p-2 rounded-lg bg-[#222028] group-hover:bg-[#ff4500]/20 text-[#a5a6af] group-hover:text-[#ff4500] transition-colors">
                <Layers className="w-4 h-4" />
              </div>
              <span>Create Series</span>
            </Link>

            <Link
              href="/studio/categories"
              className="flex items-center gap-3 p-3 rounded-xl bg-[#17161a] hover:bg-[#201e25] border border-[#25232c] text-xs font-semibold text-white transition-all group"
            >
              <div className="p-2 rounded-lg bg-[#222028] group-hover:bg-[#ff4500]/20 text-[#a5a6af] group-hover:text-[#ff4500] transition-colors">
                <LayoutGrid className="w-4 h-4" />
              </div>
              <span>Manage Categories</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ================= 4. LOWER ROW: RECENT EPISODES, PENDING APPROVALS & RECENT ACTIVITY ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Recent Episodes Table (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#111013] border border-[#222026] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              Recent Episodes
            </h3>
            <Link
              href="/studio/episodes"
              className="text-xs text-[#a5a6af] hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>See all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#222026] text-[#6e6f77] text-[10px] uppercase font-mono">
                  <th className="pb-2">Episode</th>
                  <th className="pb-2">Creator</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Plays</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1c22]">
                {[
                  {
                    title: "Purpose in the Process",
                    duration: "45:20",
                    creator: "The Forge Podcast",
                    status: "Published",
                    plays: "2.4K",
                    date: "Oct 12, 2024",
                    artwork: "/images/card-forge-podcast.jpg",
                  },
                  {
                    title: "Faith Over Fear",
                    duration: "38:15",
                    creator: "Faith in Action",
                    status: "Published",
                    plays: "1.8K",
                    date: "Oct 5, 2024",
                    artwork: "/images/card-faith-action.jpg",
                  },
                  {
                    title: "A Life That Matters",
                    duration: "52:17",
                    creator: "Kingdom Minds",
                    status: "Scheduled",
                    plays: "-",
                    date: "Oct 28, 2024",
                    artwork: "/images/card-kingdom-minds.jpg",
                  },
                  {
                    title: "Finding God in the Ordinary",
                    duration: "41:03",
                    creator: "Everyday Grace",
                    status: "Published",
                    plays: "3.2K",
                    date: "Sep 21, 2024",
                    artwork: "/images/card-everyday-grace.jpg",
                  },
                ].map((ep) => (
                  <tr key={ep.title} className="hover:bg-[#161519] transition-colors">
                    <td className="py-2.5 pr-2">
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0">
                          <Image
                            src={ep.artwork}
                            alt={ep.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate max-w-[120px]">
                            {ep.title}
                          </p>
                          <span className="text-[10px] text-[#6e6f77] font-mono">
                            {ep.duration}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 text-[#a5a6af] text-[11px] truncate max-w-[90px]">
                      {ep.creator}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono",
                          ep.status === "Published"
                            ? "bg-emerald-950/70 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-950/70 text-[#ffb13b] border border-amber-500/30"
                        )}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {ep.status}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-white text-[11px]">
                      {ep.plays}
                    </td>
                    <td className="py-2.5 text-[#6e6f77] text-[10px] font-mono whitespace-nowrap">
                      {ep.date}
                    </td>
                    <td className="py-2.5 text-right">
                      <button className="p-1 rounded hover:bg-[#222] text-[#6e6f77] hover:text-white">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Column 2: Pending Approvals (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#111013] border border-[#222026] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              Pending Approvals
            </h3>
            <Link
              href="/admin/users"
              className="text-xs text-[#a5a6af] hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>See all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveApprovalTab("creators")}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold transition-all",
                activeApprovalTab === "creators"
                  ? "bg-[#e63900] text-white"
                  : "bg-[#18171b] text-[#8e8d94] hover:text-white"
              )}
            >
              Creators <span className="ml-1 text-[10px]">{pendingCreators.length}</span>
            </button>
            <button
              onClick={() => setActiveApprovalTab("episodes")}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold transition-all",
                activeApprovalTab === "episodes"
                  ? "bg-[#e63900] text-white"
                  : "bg-[#18171b] text-[#8e8d94] hover:text-white"
              )}
            >
              Episodes <span className="ml-1 text-[10px]">8</span>
            </button>
            <button
              onClick={() => setActiveApprovalTab("comments")}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold transition-all",
                activeApprovalTab === "comments"
                  ? "bg-[#e63900] text-white"
                  : "bg-[#18171b] text-[#8e8d94] hover:text-white"
              )}
            >
              Comments <span className="ml-1 text-[10px]">24</span>
            </button>
          </div>

          {/* Creators List */}
          <div className="space-y-3">
            {pendingCreators.map((creator) => (
              <div
                key={creator.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-[#161519] transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
                    <Image
                      src={creator.avatar}
                      alt={creator.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {creator.name}
                    </p>
                    <span className="text-[10px] text-[#6e6f77] block truncate">
                      {creator.role} • {creator.time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <button
                    onClick={() => handleApprove(creator.id)}
                    className="px-2.5 py-1 rounded-md bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-400 text-[11px] font-bold transition-all"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(creator.id)}
                    className="px-2.5 py-1 rounded-md bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-400 text-[11px] font-bold transition-all"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Recent Activity (3 cols) */}
        <div className="lg:col-span-3 p-5 rounded-2xl bg-[#111013] border border-[#222026] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              Recent Activity
            </h3>
            <Link
              href="/admin/activity"
              className="text-xs text-[#a5a6af] hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>See all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {[
              {
                icon: Users,
                text: "New user registered",
                time: "2 minutes ago",
                color: "text-[#ff7733] bg-[#ff7733]/10",
              },
              {
                icon: UploadCloud,
                text: "Episode uploaded",
                time: "15 minutes ago",
                color: "text-[#ffb13b] bg-[#ffb13b]/10",
              },
              {
                icon: Mic,
                text: "Creator application submitted",
                time: "32 minutes ago",
                color: "text-[#ff4500] bg-[#ff4500]/10",
              },
              {
                icon: MessageSquare,
                text: "New comment received",
                time: "1 hour ago",
                color: "text-amber-400 bg-amber-400/10",
              },
              {
                icon: Download,
                text: "Episode downloaded",
                time: "2 hours ago",
                color: "text-cyan-400 bg-cyan-400/10",
              },
            ].map((act, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className={cn("p-2 rounded-xl shrink-0", act.color)}>
                  <act.icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">
                    {act.text}
                  </p>
                  <span className="text-[10px] text-[#6e6f77] font-mono">
                    {act.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= 5. BOTTOM ROW: TOP EPISODES & TOP CATEGORIES ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Episodes (8 cols) */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-[#111013] border border-[#222026] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              Top Episodes
            </h3>
            <Link
              href="/studio/episodes"
              className="text-xs text-[#a5a6af] hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>See all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[
              {
                rank: 1,
                title: "A Life That Matters",
                plays: "3.2K plays",
                image: "/images/card-kingdom-minds.jpg",
              },
              {
                rank: 2,
                title: "Purpose in the Process",
                plays: "2.4K plays",
                image: "/images/card-forge-podcast.jpg",
              },
              {
                rank: 3,
                title: "Faith Over Fear",
                plays: "1.8K plays",
                image: "/images/card-faith-action.jpg",
              },
              {
                rank: 4,
                title: "Walking in Purpose",
                plays: "1.1K plays",
                image: "/images/card-everyday-grace.jpg",
              },
              {
                rank: 5,
                title: "Real Talk: Faith and Culture",
                plays: "980 plays",
                image: "/images/card-real-talk.jpg",
              },
            ].map((ep) => (
              <div
                key={ep.rank}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-[#161519] border border-[#24222b] hover:border-[#ff4500]/40 transition-all"
              >
                <span className="font-heading font-black text-sm text-[#ffb13b] w-4 text-center shrink-0">
                  {ep.rank}
                </span>
                <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={ep.image}
                    alt={ep.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-white truncate">
                    {ep.title}
                  </p>
                  <span className="text-[10px] text-[#6e6f77] font-mono">
                    {ep.plays}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#111013] border border-[#222026] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              Top Categories
            </h3>
            <Link
              href="/studio/categories"
              className="text-xs text-[#a5a6af] hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>See all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {[
              { name: "Faith & Life", count: 320, pct: 90, icon: BookOpen },
              { name: "Purpose", count: 280, pct: 78, icon: Sparkles },
              { name: "Worship", count: 240, pct: 67, icon: Radio },
              { name: "Culture", count: 180, pct: 50, icon: Globe },
              { name: "Mental Health", count: 150, pct: 42, icon: Heart },
            ].map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <cat.icon className="w-3.5 h-3.5 text-[#ff7733]" />
                    <span className="text-white">{cat.name}</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#a5a6af]">
                    {cat.count}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#1c1b20] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#ff4500] to-[#ffb13b] rounded-full"
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
