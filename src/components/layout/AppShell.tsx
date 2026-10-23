"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Users,
  Library,
  Play,
  Pause,
  X,
  Bookmark,
  ListMusic,
  History,
  BookOpen,
  Layers,
  Mic,
  Flame,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { currentEpisode, isPlaying, togglePlay, toggleNowPlayingExpanded } =
    useAudioPlayer();

  const mobileNavItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Browse", href: "/browse", icon: Compass },
    { name: "Community", href: "/community", icon: Users },
    { name: "Library", href: "/library", icon: Library },
  ];

  // Do not render public streaming shell inside Gospel Forge Studio or full-screen Auth / Onboarding pages
  if (
    pathname?.startsWith("/studio") ||
    pathname === "/signup" ||
    pathname === "/login" ||
    pathname?.startsWith("/artist") ||
    pathname?.startsWith("/onboarding")
  ) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#080706]">
      <div className="flex flex-1">
        {/* Desktop Left Sidebar */}
        <Sidebar />

        {/* Mobile Navigation Drawer Modal */}
        {isMobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsMobileNavOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-[#0e0d0e] border-r border-[#222123] p-5 flex flex-col z-10 animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-[#222123]">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#ff4500]/50">
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
                </div>
                <button
                  onClick={() => setIsMobileNavOpen(false)}
                  className="p-1.5 rounded-lg text-[#a5a6af] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                <nav className="space-y-1">
                  {[
                    { name: "Home", href: "/", icon: Home },
                    { name: "Browse", href: "/browse", icon: Compass },
                    { name: "Library", href: "/library", icon: Library },
                    { name: "Community", href: "/community", icon: Users },
                    { name: "Scripture", href: "/scripture", icon: BookOpen },
                    { name: "Series", href: "/series", icon: Layers },
                    { name: "Speakers", href: "/speakers", icon: Mic },
                    { name: "Saved Episodes", href: "/saved", icon: Bookmark },
                    { name: "Playlists", href: "/playlists", icon: ListMusic },
                    { name: "Listening History", href: "/history", icon: History },
                  ].map((item) => {
                    const isActive =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileNavOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                          isActive
                            ? "bg-[#1c1b1b] text-white font-semibold shadow-[inset_3px_0_0_#ff4500]"
                            : "text-[#a5a6af] hover:text-white"
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-4 h-4",
                            isActive ? "text-[#ff4500]" : "text-[#a5a6af]"
                          )}
                        />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Center Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header onToggleMobileNav={() => setIsMobileNavOpen(true)} />
          <main className="flex-1 pb-28 md:pb-28 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>

      {/* MOBILE MINI-PLAYER (Floating above bottom navigation) */}
      {currentEpisode && (
        <div
          onClick={() => toggleNowPlayingExpanded(true)}
          className="lg:hidden fixed bottom-14 left-2 right-2 h-14 bg-[#141314]/95 backdrop-blur-md border border-[#2a2929] rounded-xl z-30 flex items-center justify-between px-3 shadow-2xl cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[#2a2929]">
              <Image
                src={currentEpisode.artworkUrl}
                alt={currentEpisode.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">
                {currentEpisode.title}
              </p>
              <p className="text-[10px] text-[#ffb13b] truncate">
                {currentEpisode.seriesTitle}
              </p>
            </div>
          </div>

          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={togglePlay}
              className="p-2 rounded-full bg-gradient-to-tr from-[#ff4500] to-[#ffb13b] text-[#080706] shadow-[0_0_12px_rgba(255,69,0,0.5)]"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#0a090a] border-t border-[#222123] z-30 flex items-center justify-around px-2">
        {mobileNavItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-3 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-[#ff4500] font-bold"
                  : "text-[#a5a6af] hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
