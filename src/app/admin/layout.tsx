"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Mic,
  Radio,
  Layers,
  Music2,
  LayoutGrid,
  ShieldCheck,
  BarChart2,
  FileText,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const topNavLinks = [
    { name: "Dashboard", href: "/admin" },
    { name: "Users", href: "/admin/users" },
    { name: "Content", href: "/admin/content" },
    { name: "Analytics", href: "/admin/analytics" },
    { name: "Reports", href: "/admin/reports" },
    { name: "Settings", href: "/admin/settings" },
  ];

  const adminNavItems = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Creators", href: "/admin/creators", icon: Mic },
    { name: "Episodes", href: "/admin/episodes", icon: Radio },
    { name: "Series", href: "/admin/series", icon: Layers },
    { name: "Playlists", href: "/admin/playlists", icon: Music2 },
    { name: "Categories", href: "/admin/categories", icon: LayoutGrid },
    { name: "Moderation", href: "/admin/moderation", icon: ShieldCheck },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart2 },
    { name: "Reports", href: "/admin/reports", icon: FileText },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#080706] text-[#f5f0ea]">
      {/* 1. TOP GLOBAL ADMIN HEADER */}
      <header className="sticky top-0 z-30 h-16 bg-[#080706]/95 backdrop-blur-xl border-b border-[#1f1e21] px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Mobile menu trigger */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-[#141315] text-[#a5a6af] hover:text-white border border-[#222025]"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Global Admin Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#a5a6af]">
          {topNavLinks.map((link) => {
            const isActive =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "transition-colors",
                  isActive ? "text-white font-bold" : "hover:text-white"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Search Input, Notification Bell & Admin Avatar */}
        <div className="flex items-center gap-3 sm:gap-4 ml-auto">
          <div className="relative hidden sm:block w-64 md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6e6f77]" />
            <input
              type="text"
              placeholder="Search users, episodes, creators..."
              className="w-full pl-9 pr-4 py-2 rounded-full bg-[#131215] border border-[#222026] text-xs text-white placeholder-[#6e6f77] focus:outline-none focus:border-[#ff4500] transition-colors"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-full bg-[#141316] hover:bg-[#1f1e22] text-[#a5a6af] hover:text-white transition-colors border border-[#222026]">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#ff4500] text-[9px] font-mono font-bold text-white flex items-center justify-center">
              0
            </span>
          </button>

          {/* Admin Profile Chip */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-[#222026]">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#ffb13b]/40">
              <Image
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80"
                alt="Admin Avatar"
                fill
                className="object-cover"
              />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-white leading-tight">Admin</p>
              <p className="text-[10px] text-[#a5a6af] leading-tight">
                {currentUser?.role === "super_admin" ? "Super Admin" : "Administrator"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 2. BODY: LEFT SIDEBAR + MAIN CONTENT */}
      <div className="flex flex-1">
        {/* DESKTOP ADMIN PANEL SIDEBAR */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-60 bg-[#0c0b0e] border-r border-[#ff4500]/20 flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 shadow-[2px_0_15px_rgba(255,69,0,0.06)]",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Brand Logo Header */}
          <div className="h-16 px-5 border-b border-[#1c1b1f] flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full overflow-hidden shadow-[0_0_12px_rgba(255,69,0,0.4)]">
                <Image
                  src="/images/gospel-forge-emblem.jpg"
                  alt="Gospel Forge Emblem"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-sm font-black tracking-wider text-white">
                  GOSPEL
                </span>
                <span className="font-heading text-[10px] tracking-widest text-[#ffb13b] font-bold">
                  FORGE
                </span>
              </div>
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-[#6e6f77] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
            <div>
              <span className="px-3 text-[11px] font-bold text-[#6e6f77] uppercase tracking-wider block mb-2">
                Admin Panel
              </span>
              <nav className="space-y-1">
                {adminNavItems.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-[#e63900] to-[#b32400] text-white shadow-[0_0_20px_rgba(230,57,0,0.5)] border border-[#ff4500]/40"
                          : "text-[#a5a6af] hover:text-white hover:bg-[#161519]"
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
            </div>
          </div>

          {/* Footer status pill */}
          <div className="p-3 border-t border-[#1c1b1f] text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Forge Network Online</span>
            </span>
          </div>
        </aside>

        {/* MAIN ADMIN DASHBOARD CONTENT */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
