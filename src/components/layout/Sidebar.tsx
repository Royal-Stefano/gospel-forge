"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Library,
  Users,
  BookOpen,
  Layers,
  Mic,
  Bookmark,
  ListMusic,
  History,
  Download,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MAIN_NAV: NavItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Browse", href: "/browse", icon: Compass },
  { name: "Library", href: "/library", icon: Library },
  { name: "Community", href: "/community", icon: Users },
  { name: "Scripture", href: "/scripture", icon: BookOpen },
  { name: "Series", href: "/series", icon: Layers },
  { name: "Speakers", href: "/speakers", icon: Mic },
];

const LIBRARY_NAV: NavItem[] = [
  { name: "Saved Episodes", href: "/saved", icon: Bookmark },
  { name: "Playlists", href: "/playlists", icon: ListMusic },
  { name: "Listening History", href: "/history", icon: History },
  { name: "Downloads", href: "/downloads", icon: Download },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-[250px] shrink-0 flex-col bg-[#0e0d0e] border-r border-[#222123] h-[calc(100vh-88px)] select-none">
      {/* Brand Logo Section */}
      <div className="p-5 pb-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 rounded-full overflow-hidden border border-[#ff4500]/40 group-hover:border-[#ff4500] transition-all duration-300 shadow-[0_0_15px_rgba(255,69,0,0.3)]">
            <Image
              src="/images/gospel-forge-emblem.jpg"
              alt="Gospel Forge Logo"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-lg tracking-wider text-white flex items-center gap-1.5 leading-none">
              GOSPEL
            </span>
            <span className="font-heading font-bold text-sm tracking-widest text-[#ff4500] flex items-center gap-1 leading-tight">
              FORGE
              <Flame className="w-3.5 h-3.5 text-[#ffb13b] animate-pulse" />
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        <div>
          <nav className="space-y-1">
            {MAIN_NAV.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                    isActive
                      ? "bg-[#1c1b1b] text-white font-semibold shadow-[inset_3px_0_0_#ff4500]"
                      : "text-[#a5a6af] hover:text-white hover:bg-[#161516]"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive
                        ? "text-[#ff4500]"
                        : "text-[#a5a6af] group-hover:text-white"
                    )}
                  />
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#ff4500] shadow-[0_0_6px_#ff4500]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-[#6e6f77] mb-2 font-mono">
            Your Library
          </p>
          <nav className="space-y-1">
            {LIBRARY_NAV.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                    isActive
                      ? "bg-[#1c1b1b] text-white font-semibold shadow-[inset_3px_0_0_#ff4500]"
                      : "text-[#a5a6af] hover:text-white hover:bg-[#161516]"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive
                        ? "text-[#ff4500]"
                        : "text-[#a5a6af] group-hover:text-white"
                    )}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Forged Frequency Brand Banner footer in sidebar */}
      <div className="p-3 m-3 rounded-xl bg-gradient-to-br from-[#1a1412] to-[#121111] border border-[#ff4500]/20">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#ffb13b] font-bold">
            Live Stream
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <p className="text-xs text-[#a5a6af] font-body line-clamp-2">
          Faith has a frequency. The Word. Amplified.
        </p>
      </div>
    </aside>
  );
}
