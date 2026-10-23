"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bell, Menu, X, Sparkles, User, Flame, Radio, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  onToggleMobileNav?: () => void;
}

export function Header({ onToggleMobileNav }: HeaderProps) {
  const router = useRouter();
  const { currentUser, canAccessStudio } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#080706]/90 backdrop-blur-md border-b border-[#222123] px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Mobile Brand / Toggle */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={onToggleMobileNav}
          className="p-2 rounded-lg bg-[#1c1b1b] text-white hover:text-[#ff4500] border border-[#2a2929]"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#ff4500]/50 shadow-[0_0_10px_rgba(255,69,0,0.4)]">
            <Image
              src="/images/gospel-forge-emblem.jpg"
              alt="Gospel Forge"
              fill
              className="object-cover"
            />
          </div>
          <span className="font-heading font-extrabold text-sm tracking-wide text-white">
            GOSPEL <span className="text-[#ff4500]">FORGE</span>
          </span>
        </Link>
      </div>

      {/* Center Search Input */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex-1 max-w-xl mx-auto hidden sm:block"
      >
        <div className="relative flex items-center group">
          <Search className="absolute left-3.5 w-4 h-4 text-[#a5a6af] group-focus-within:text-[#ff4500] transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search episodes, topics, scripture, or creators..."
            className="w-full bg-[#141314] text-sm text-[#f5f0ea] placeholder-[#6e6f77] pl-10 pr-4 py-2 rounded-full border border-[#262527] focus:border-[#ff4500] focus:ring-1 focus:ring-[#ff4500] focus:outline-none transition-all duration-200"
          />
        </div>
      </form>

      {/* Right controls: Studio Shortcut, Notifications, User profile / Sign in */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Studio Link Shortcut if Staff */}
        {canAccessStudio && (
          <Link
            href="/studio"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ff4500]/15 hover:bg-[#ff4500]/25 border border-[#ff4500]/40 text-[#ffb13b] text-xs font-mono font-bold uppercase transition-all shadow-[0_0_10px_rgba(255,69,0,0.3)]"
          >
            <Flame className="w-3.5 h-3.5 text-[#ff4500] animate-pulse" />
            <span>Studio</span>
          </Link>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full bg-[#141314] hover:bg-[#1c1b1b] border border-[#262527] text-[#a5a6af] hover:text-white transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ff4500] shadow-[0_0_6px_#ff4500]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#141314] border border-[#2a2929] shadow-2xl p-4 text-xs z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#262527] mb-3">
                <span className="font-semibold text-white uppercase tracking-wider font-mono">
                  Notifications
                </span>
                <span className="text-[10px] text-[#ffb13b]">2 new</span>
              </div>
              <div className="space-y-3">
                <div className="p-2 rounded-lg bg-[#1c1b1b]/80 border border-[#2e2d2f]">
                  <p className="text-white font-medium">New Episode Released!</p>
                  <p className="text-[#a5a6af] mt-0.5">
                    The Forge Podcast: Purpose in the Process is now streaming.
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-[#1c1b1b]/80 border border-[#2e2d2f]">
                  <p className="text-white font-medium">Community Discussion</p>
                  <p className="text-[#a5a6af] mt-0.5">
                    Marcus T. replied to your post on Romans 8:28.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Pill or Sign In */}
        {currentUser ? (
          <Link
            href="/profile"
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-[#141314] hover:bg-[#1c1b1b] border border-[#262527] hover:border-[#ff4500]/50 transition-all duration-200 group"
          >
            <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#ff4500]/40">
              <Image
                src={currentUser.avatarUrl}
                alt={currentUser.displayName}
                fill
                className="object-cover"
              />
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-[10px] text-[#a5a6af] leading-none">
                Welcome back
              </span>
              <span className="text-xs font-semibold text-white group-hover:text-[#ffb13b] transition-colors leading-tight truncate max-w-[120px]">
                {currentUser.displayName}
              </span>
            </div>
          </Link>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1c1b1b] hover:bg-[#252426] border border-[#2e2d2f] text-xs font-semibold text-white transition-colors"
          >
            <LogIn className="w-3.5 h-3.5 text-[#ff4500]" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}
