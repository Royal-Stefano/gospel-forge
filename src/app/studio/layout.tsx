"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Radio,
  PlusCircle,
  Layers,
  Tag,
  Mic,
  HardDrive,
  Calendar,
  Users,
  ShieldCheck,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  ShieldAlert,
  Flame,
  Menu,
  X,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface StudioNavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
}

const STUDIO_NAV: StudioNavItem[] = [
  { name: "Dashboard", href: "/studio", icon: LayoutDashboard },
  { name: "Episodes", href: "/studio/episodes", icon: Radio },
  {
    name: "Upload New Episode",
    href: "/studio/episodes/new",
    icon: PlusCircle,
    badge: "WIZARD",
  },
  { name: "Series & Shows", href: "/studio/series", icon: Layers },
  { name: "Categories & Topics", href: "/studio/categories", icon: Tag },
  { name: "Speakers", href: "/studio/speakers", icon: Mic },
  { name: "Media Storage", href: "/studio/media", icon: HardDrive },
  { name: "Scheduled Releases", href: "/studio/scheduled", icon: Calendar },
  { name: "Users & Accounts", href: "/studio/users", icon: Users, adminOnly: true },
  {
    name: "Roles & Security",
    href: "/studio/roles",
    icon: ShieldCheck,
    superAdminOnly: true,
  },
  {
    name: "Community Moderation",
    href: "/studio/community",
    icon: MessageSquare,
  },
  { name: "Analytics", href: "/studio/analytics", icon: BarChart3 },
  { name: "Settings", href: "/studio/settings", icon: Settings },
];

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, canAccessStudio, login } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Allow login page to render without layout lock
  if (pathname === "/studio/login") {
    return <>{children}</>;
  }

  // 1. Check if user is not logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#080706] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#111113] border border-[#ff4500]/30 shadow-2xl text-center space-y-6">
          <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-[#ff4500] shadow-[0_0_20px_rgba(255,69,0,0.4)]">
            <Image
              src="/images/gospel-forge-emblem.jpg"
              alt="Gospel Forge"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold text-white">
              Gospel Forge Studio
            </h2>
            <p className="text-xs text-[#a5a6af] mt-1 font-body">
              Authentication required to access studio production tools.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <Link
              href="/studio/login"
              className="block w-full py-3 rounded-full bg-gradient-to-r from-[#ff4500] to-[#ffb13b] text-black font-heading font-bold text-xs uppercase tracking-wider shadow-lg"
            >
              Sign In to Studio
            </Link>
            <Link
              href="/"
              className="block w-full py-2.5 rounded-full bg-[#181719] hover:bg-[#201f22] border border-[#262527] text-xs text-[#a5a6af] hover:text-white"
            >
              Back to Public Streaming
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Listener role access restriction test (Milestone Step 2: "A listener cannot access Studio")
  if (!canAccessStudio) {
    return (
      <div className="min-h-screen bg-[#080706] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#140c0b] border border-[#8f1609] shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#8f1609]/30 text-[#ff4500] border border-[#8f1609] flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold">
              Access Restricted
            </span>
            <h2 className="font-heading text-2xl font-bold text-white mt-1">
              Listener Access Denied
            </h2>
            <p className="text-xs text-[#a5a6af] mt-2 font-body leading-relaxed">
              You are currently logged in as{" "}
              <strong className="text-white">{currentUser.displayName}</strong>{" "}
              (<code className="text-[#ffb13b]">listener</code>). Gospel Forge
              Studio is strictly reserved for authorized producers, audio
              editors, and administrators.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#1c1211] border border-[#ff4500]/20 text-left text-xs font-mono space-y-2">
            <p className="text-[#ffb13b] font-bold text-[11px]">
              Switch to staff account for testing:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => login("admin@gospelforge.com", "ForgeAdmin#2026")}
                className="p-2 rounded bg-[#2a1714] text-white hover:bg-[#ff4500] hover:text-black font-semibold text-[10px] transition-colors"
              >
                Log In as Admin
              </button>
              <button
                onClick={() => login("superadmin@gospelforge.com", "ForgeAdmin#2026")}
                className="p-2 rounded bg-[#2a1714] text-white hover:bg-[#ff4500] hover:text-black font-semibold text-[10px] transition-colors"
              >
                Log In as Super Admin
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1c1b1b] hover:bg-[#252426] border border-[#2a2929] text-xs font-semibold text-white transition-colors"
            >
              <span>Return to Public Player</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized Staff Studio Experience (Editor, Admin, Super Admin)
  const roleBadgeColors: Record<string, string> = {
    super_admin: "bg-red-950/80 text-red-300 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]",
    admin: "bg-[#ff4500]/15 text-[#ffb13b] border-[#ff4500]/40 shadow-[0_0_10px_rgba(255,69,0,0.3)]",
    editor: "bg-blue-950/80 text-blue-300 border-blue-500/40",
  };

  return (
    <div className="min-h-screen bg-[#080706] text-[#f5f0ea] flex">
      {/* STUDIO DESKTOP SIDEBAR (260px) */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-[#0b0a0b] border-r border-[#1f1e20] h-screen sticky top-0 select-none">
        {/* Brand Header */}
        <div className="p-5 pb-4 border-b border-[#1f1e20]">
          <Link href="/studio" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#ff4500]/50 shadow-[0_0_15px_rgba(255,69,0,0.4)]">
              <Image
                src="/images/gospel-forge-emblem.jpg"
                alt="Gospel Forge Studio"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span className="font-heading font-extrabold text-sm tracking-wider text-white block leading-none">
                GOSPEL FORGE
              </span>
              <span className="font-mono text-[10px] tracking-widest text-[#ff4500] font-bold uppercase flex items-center gap-1 mt-0.5">
                STUDIO <Flame className="w-3 h-3 text-[#ffb13b]" />
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {STUDIO_NAV.map((item) => {
            if (item.superAdminOnly && currentUser.role !== "super_admin") return null;
            if (item.adminOnly && !["admin", "super_admin"].includes(currentUser.role)) return null;

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
                  "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group",
                  isActive
                    ? "bg-[#181719] text-white font-semibold shadow-[inset_3px_0_0_#ff4500] border border-[#262527]"
                    : "text-[#a5a6af] hover:text-white hover:bg-[#131214]"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      isActive
                        ? "text-[#ff4500]"
                        : "text-[#6e6f77] group-hover:text-white"
                    )}
                  />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#ff4500]/20 text-[#ffb13b] border border-[#ff4500]/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom User Profile & Switcher */}
        <div className="p-3 border-t border-[#1f1e20] bg-[#0e0d0f] space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[#141315] border border-[#222123]">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#ff4500]/40 shrink-0">
              <Image
                src={currentUser.avatarUrl}
                alt={currentUser.displayName}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {currentUser.displayName}
              </p>
              <span
                className={cn(
                  "inline-block px-1.5 py-0.2 rounded text-[9px] font-mono uppercase tracking-wider font-bold border mt-0.5",
                  roleBadgeColors[currentUser.role]
                )}
              >
                {currentUser.role.replace("_", " ")}
              </span>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-[#6e6f77] hover:text-red-400 hover:bg-[#1e1d1f] transition-colors"
              title="Log Out of Studio"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-[#161517] hover:bg-[#1e1d1f] border border-[#262527] text-[11px] font-mono text-[#a5a6af] hover:text-white transition-colors"
          >
            <span>View Public Platform</span>
            <ExternalLink className="w-3 h-3 text-[#ff4500]" />
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Studio Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-[#0c0b0c]/90 backdrop-blur-md border-b border-[#1f1e20] px-4 md:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-[#141315] border border-[#222123] text-[#a5a6af] lg:hidden"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-sm text-white">Studio</span>
              <span className="text-[#6e6f77]">/</span>
              <span className="text-xs font-mono text-[#a5a6af] capitalize">
                {pathname.replace("/studio", "").replace("/", "") || "Overview"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={cn(
                "hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider font-bold border",
                roleBadgeColors[currentUser.role]
              )}
            >
              <UserCheck className="w-3 h-3" />
              <span>{currentUser.role.replace("_", " ")}</span>
            </span>

            <Link
              href="/studio/episodes/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#ff4500] to-[#ffb13b] text-black font-heading font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(255,69,0,0.4)] hover:scale-105 active:scale-95 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Episode</span>
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden p-4 bg-[#0e0d0f] border-b border-[#1f1e20] space-y-2">
            {STUDIO_NAV.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-[#a5a6af] hover:text-white hover:bg-[#181719]"
              >
                <item.icon className="w-4 h-4 text-[#ff4500]" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
