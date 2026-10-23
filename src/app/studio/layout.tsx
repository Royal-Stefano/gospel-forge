"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Radio,
  Headphones,
  BarChart3,
  Users,
  MessageSquare,
  DollarSign,
  Settings,
  UploadCloud,
  HardDrive,
  Calendar,
  Globe,
  Bell,
  Search,
  Crown,
  Menu,
  X,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { PersistentPlayer } from "@/components/player/PersistentPlayer";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Allow login page to render without layout lock
  if (pathname === "/studio/login") {
    return <>{children}</>;
  }

  const mainStudioNav = [
    { name: "Dashboard", href: "/studio", icon: LayoutDashboard },
    { name: "My Podcast", href: "/studio/series", icon: Radio },
    { name: "Episodes", href: "/studio/episodes", icon: Headphones },
    { name: "Analytics", href: "/studio/analytics", icon: BarChart3 },
    { name: "Audience", href: "/studio/users", icon: Users },
    { name: "Comments", href: "/studio/community", icon: MessageSquare },
    { name: "Monetization", href: "/studio/roles", icon: DollarSign },
    { name: "Settings", href: "/studio/settings", icon: Settings },
  ];

  const toolsStudioNav = [
    { name: "Episode Upload", href: "/studio/episodes/new", icon: UploadCloud },
    { name: "Media Library", href: "/studio/media", icon: HardDrive },
    { name: "Scheduled", href: "/studio/scheduled", icon: Calendar },
    { name: "Integrations", href: "/studio/categories", icon: Globe },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#080706] text-[#f5f0ea]">
      {/* 1. TOP CREATOR STUDIO NAVIGATION HEADER */}
      <header className="sticky top-0 z-30 h-16 bg-[#080706]/95 backdrop-blur-xl border-b border-[#1f1e21] px-4 md:px-8 flex items-center justify-between gap-4">
        {/* Mobile menu trigger */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-[#141315] text-[#a5a6af] hover:text-white border border-[#222025]"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Global public streaming navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-[#a5a6af]">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/browse" className="hover:text-white transition-colors">
            Discover
          </Link>
          <Link href="/episodes/purpose-in-the-process" className="hover:text-white transition-colors">
            Episodes
          </Link>
          <Link href="/series" className="hover:text-white transition-colors">
            Series
          </Link>
          <Link href="/scripture" className="hover:text-white transition-colors">
            Scripture
          </Link>
          <Link href="/community" className="hover:text-white transition-colors">
            Community
          </Link>
        </nav>

        {/* Right Search Input, Notifications & Creator Avatar Badge */}
        <div className="flex items-center gap-3 sm:gap-4 ml-auto">
          <div className="relative hidden md:block w-56 lg:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6e6f77]" />
            <input
              type="text"
              placeholder="Search episodes, topics, or creators..."
              className="w-full bg-[#121114]/90 text-xs text-[#f5f0ea] placeholder-[#6e6f77] pl-9 pr-3 py-2 rounded-xl border border-[#262429] focus:border-[#ff4500] focus:outline-none"
            />
          </div>

          <button
            className="p-2 rounded-full bg-[#141316] text-[#a5a6af] hover:text-white relative border border-[#242327]"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#ff4500]" />
          </button>

          {/* Creator Profile Badge with Golden Ring */}
          <div className="flex items-center gap-2.5 pl-1">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#ffb13b]/80 shadow-md">
              <Image
                src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"}
                alt="Creator Profile"
                fill
                className="object-cover"
              />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[11px] font-mono font-bold text-white leading-tight">
                Creator Studio
              </span>
              <span className="text-[10px] text-[#a5a6af] leading-tight">
                {currentUser?.name || "John Matthews"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. BODY WITH CREATOR STUDIO SIDEBAR & CONTENT */}
      <div className="flex flex-1">
        {/* DESKTOP CREATOR STUDIO SIDEBAR */}
        <aside className="hidden lg:flex w-[220px] xl:w-[240px] shrink-0 flex-col bg-[#0b0a0c] border-r border-[#1f1e21] h-[calc(100vh-84px-64px)] select-none sticky top-16 overflow-y-auto z-20">
          {/* Logo Section */}
          <div className="pt-5 pb-3 px-4 flex justify-center">
            <Link href="/" className="group flex flex-col items-center">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border border-[#ff4500]/50 group-hover:border-[#ff4500] transition-all duration-300 shadow-[0_0_20px_rgba(255,69,0,0.4)]">
                <Image
                  src="/images/gospel-forge-emblem.jpg"
                  alt="Gospel Forge"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>
            </Link>
          </div>

          <div className="flex-1 px-3 py-2 space-y-5">
            {/* Main Creator Studio Items */}
            <div>
              <span className="px-3.5 text-[11px] font-bold text-[#6e6f77] uppercase tracking-wider block mb-1.5">
                Creator Studio
              </span>
              <nav className="space-y-1">
                {mainStudioNav.map((item) => {
                  const isActive =
                    item.href === "/studio"
                      ? pathname === "/studio"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-[#e63900] to-[#b32400] text-white shadow-[0_0_20px_rgba(230,57,0,0.5)] border border-[#ff4500]/40"
                          : "text-[#a5a6af] hover:text-white hover:bg-[#171618]"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-[#a5a6af]")} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Tools Section */}
            <div>
              <span className="px-3.5 text-[11px] font-bold text-[#6e6f77] uppercase tracking-wider block mb-1.5">
                Tools
              </span>
              <nav className="space-y-1">
                {toolsStudioNav.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-[#e63900] to-[#b32400] text-white shadow-[0_0_20px_rgba(230,57,0,0.5)] border border-[#ff4500]/40"
                          : "text-[#a5a6af] hover:text-white hover:bg-[#171618]"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-[#a5a6af]")} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Creator Pro Upgrade Card at Bottom */}
          <div className="p-3 m-3 rounded-2xl bg-gradient-to-b from-[#161418] to-[#0f0e11] border border-[#2a282e] shadow-xl text-center space-y-2">
            <div className="flex justify-center">
              <div className="p-1.5 rounded-full bg-[#ffb13b]/10 text-[#ffb13b]">
                <Crown className="w-4 h-4 fill-current" />
              </div>
            </div>
            <h4 className="font-heading text-xs font-bold text-white tracking-wide">
              Creator Pro
            </h4>
            <p className="text-[10px] text-[#a5a6af] leading-relaxed">
              Unlock advanced analytics, custom branding, and more.
            </p>
            <button className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#ff4500] to-[#e63900] text-white font-heading font-bold text-[11px] tracking-wide hover:shadow-[0_0_15px_rgba(255,69,0,0.6)] transition-all">
              Upgrade Now
            </button>
          </div>
        </aside>

        {/* MAIN STUDIO CONTENT AREA */}
        <main className="flex-1 min-w-0 pb-24 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Persistent Audio Dock */}
      <PersistentPlayer />
    </div>
  );
}
