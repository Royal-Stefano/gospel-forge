"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Headphones,
  Layers,
  BookOpen,
  Users,
  Mic,
  Bookmark,
  ListMusic,
  History,
  Crown,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MAIN_NAV: NavItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Discover", href: "/browse", icon: Compass },
  { name: "Episodes", href: "/episodes/purpose-in-the-process", icon: Headphones },
  { name: "Series", href: "/series", icon: Layers },
  { name: "Scripture", href: "/scripture", icon: BookOpen },
  { name: "Community", href: "/community", icon: Users },
  { name: "Speakers", href: "/speakers", icon: Mic },
];

const LIBRARY_NAV: NavItem[] = [
  { name: "Saved Episodes", href: "/saved", icon: Bookmark },
  { name: "Playlists", href: "/playlists", icon: ListMusic },
  { name: "Listening History", href: "/history", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser, canAccessStudio, openAuthModal } = useAuth();

  return (
    <aside className="hidden lg:flex w-[220px] xl:w-[240px] shrink-0 flex-col bg-[#0b0a0c] border-r border-[#1f1e21] h-[calc(100vh-88px)] select-none sticky top-0 overflow-y-auto z-20">
      {/* Brand Logo Section */}
      <div className="pt-6 pb-4 px-4 flex justify-center">
        <Link href="/" className="group flex flex-col items-center">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border border-[#ff4500]/50 group-hover:border-[#ff4500] transition-all duration-300 shadow-[0_0_25px_rgba(255,69,0,0.4)]">
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

      {/* Navigation Sections */}
      <div className="flex-1 px-3 py-2 space-y-6">
        {/* Main Nav */}
        <nav className="space-y-1">
          {MAIN_NAV.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : item.href === "/browse"
                ? pathname === "/browse"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-[#e63900] to-[#b32400] text-white shadow-[0_0_20px_rgba(230,57,0,0.5)] border border-[#ff4500]/40"
                    : "text-[#a5a6af] hover:text-white hover:bg-[#171618]"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    isActive ? "text-white" : "text-[#a5a6af]"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Library Section */}
        <div>
          <span className="px-3.5 text-[11px] font-bold text-[#6e6f77] uppercase tracking-wider block mb-2">
            Your Library
          </span>
          <nav className="space-y-1">
            {LIBRARY_NAV.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200",
                    isActive
                      ? "bg-[#1f1e21] text-[#ffb13b] font-semibold"
                      : "text-[#a5a6af] hover:text-white hover:bg-[#171618]"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0 text-[#6e6f77]" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Studio Admin Shortcut if Staff */}
        {canAccessStudio && (
          <div className="pt-2">
            <Link
              href="/studio"
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-[#ff4500]/15 text-[#ffb13b] border border-[#ff4500]/40 hover:bg-[#ff4500]/25 transition-all shadow-[0_0_12px_rgba(255,69,0,0.25)]"
            >
              <Flame className="w-4 h-4 text-[#ff4500] animate-pulse" />
              <span>Gospel Studio</span>
            </Link>
          </div>
        )}
      </div>

      {/* Bottom Unlock More CTA Card */}
      {!currentUser && (
        <div className="p-3 m-3 rounded-2xl bg-gradient-to-b from-[#161418] to-[#0f0e11] border border-[#2a282e] shadow-xl text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-2 rounded-full bg-[#ffb13b]/10 text-[#ffb13b]">
              <Crown className="w-4 h-4 fill-current" />
            </div>
          </div>
          <h4 className="font-heading text-xs font-bold text-white tracking-wide">
            Unlock More
          </h4>
          <p className="text-[10px] text-[#a5a6af] leading-relaxed">
            Save episodes, create playlists, join the community and more.
          </p>
          <button
            onClick={() =>
              openAuthModal({
                title: "Unlock More Features",
                description:
                  "Create a free listener account to save your favorite episodes, organize playlists, and join discussions.",
              })
            }
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#ff4500] to-[#e63900] text-white font-heading font-bold text-[11px] tracking-wide hover:shadow-[0_0_15px_rgba(255,69,0,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Create a Free Account
          </button>
        </div>
      )}
    </aside>
  );
}
