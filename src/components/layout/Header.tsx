"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Menu, User, Flame } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CommandHUD } from "@/components/navigation/CommandHUD";
import { GospelForgeEmblem } from "@/components/brand/GospelForgeEmblem";

interface HeaderProps {
  onToggleMobileNav?: () => void;
}

export function Header({ onToggleMobileNav }: HeaderProps) {
  const router = useRouter();
  const { currentUser, canAccessStudio } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isHUDOpen, setIsHUDOpen] = useState(false);

  // Global Cmd+K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsHUDOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-[#080706]/95 backdrop-blur-xl border-b border-[#1c1b1e] px-4 md:px-8 flex items-center justify-between gap-4">
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
            <GospelForgeEmblem className="w-8 h-8" />
            <span className="font-heading font-extrabold text-sm tracking-wide text-white">
              GOSPEL <span className="text-[#ff4500]">FORGE</span>
            </span>
          </Link>
        </div>

        {/* Center/Left Search Input */}
        <div className="flex-1 max-w-md hidden sm:block">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative flex items-center group">
              <Search className="absolute left-3.5 w-4 h-4 text-[#6e6f77] group-focus-within:text-[#ff4500] transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search episodes, topics, scriptures, or creators..."
                className="w-full bg-[#121113] text-xs text-[#f5f0ea] placeholder-[#6e6f77] pl-10 pr-12 py-2 rounded-xl border border-[#222125] focus:border-[#ff4500] focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setIsHUDOpen(true)}
                className="absolute right-2 px-1.5 py-0.5 rounded bg-[#1c1b1e] border border-[#2a292d] text-[9px] font-mono text-[#6e6f77] hover:text-white"
                title="Command HUD (⌘K)"
              >
                ⌘K
              </button>
            </div>
          </form>
        </div>

        {/* Right Nav Links matching reference image: About, Community, Help, Sign In, Create Account */}
        <div className="flex items-center gap-4 sm:gap-6">
          <nav className="hidden md:flex items-center gap-5 text-xs text-[#a5a6af] font-medium">
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link href="/community" className="hover:text-white transition-colors">
              Community
            </Link>
            <Link href="/help" className="hover:text-white transition-colors">
              Help
            </Link>
          </nav>

          {/* Studio Link Shortcut if Staff */}
          {canAccessStudio && (
            <Link
              href="/studio"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ff4500]/15 hover:bg-[#ff4500]/25 border border-[#ff4500]/40 text-[#ffb13b] text-xs font-mono font-bold uppercase transition-all shadow-[0_0_10px_rgba(255,69,0,0.3)]"
            >
              <Flame className="w-3.5 h-3.5 text-[#ff4500] animate-pulse" />
              <span>Studio</span>
            </Link>
          )}

          {/* User Profile or Sign In / Create Account */}
          {currentUser ? (
            <Link
              href="/profile"
              className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-[#181719] transition-colors"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#2e2d2f]">
                <Image
                  src={
                    currentUser.avatarUrl ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                  }
                  alt={currentUser.name || currentUser.displayName || "Account"}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="hidden md:inline text-xs font-semibold text-white">
                {currentUser.name ? currentUser.name.split(" ")[0] : "Account"}
              </span>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-xs font-semibold text-[#f5f0ea] hover:text-[#ff4500] transition-colors px-2 py-1"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff4500] to-[#e63900] text-white text-xs font-heading font-bold hover:shadow-[0_0_18px_rgba(255,69,0,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Global Command HUD Modal */}
      <CommandHUD isOpen={isHUDOpen} onClose={() => setIsHUDOpen(false)} />
    </>
  );
}
