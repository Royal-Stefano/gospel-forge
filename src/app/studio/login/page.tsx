"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, Flame, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { GospelForgeEmblem } from "@/components/brand/GospelForgeEmblem";

export default function StudioLoginPage() {
  const router = useRouter();
  const { login, currentUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      router.push("/studio");
    } else {
      setError(result.error || "Authentication failed.");
    }
  };

  const handleQuickLogin = async (staffEmail: string, staffPass: string) => {
    setEmail(staffEmail);
    setPassword(staffPass);
    setIsSubmitting(true);
    const result = await login(staffEmail, staffPass);
    setIsSubmitting(false);
    if (result.success) {
      router.push("/studio");
    } else {
      setError(result.error || "Failed to log in.");
    }
  };

  return (
    <div className="min-h-screen bg-[#080706] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-3xl bg-[#111113] border border-[#ff4500]/30 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <GospelForgeEmblem className="w-16 h-16 shadow-[0_0_20px_rgba(255,69,0,0.5)]" size={64} />
          </div>
          <h1 className="font-heading text-2xl font-extrabold text-white tracking-wide">
            GOSPEL FORGE <span className="text-[#ff4500]">STUDIO</span>
          </h1>
          <p className="text-xs text-[#a5a6af] font-body">
            Private production & podcast content management control room.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono text-[#a5a6af] uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-[#6e6f77]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@gospelforge.com"
                className="w-full bg-[#181719] text-sm text-white placeholder-[#6e6f77] pl-10 pr-4 py-2.5 rounded-xl border border-[#2a2929] focus:border-[#ff4500] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-[#a5a6af] uppercase tracking-wider">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-[#6e6f77]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#181719] text-sm text-white placeholder-[#6e6f77] pl-10 pr-4 py-2.5 rounded-xl border border-[#2a2929] focus:border-[#ff4500] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-full bg-gradient-to-r from-[#ff4500] to-[#ffb13b] text-black font-heading font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,69,0,0.5)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{isSubmitting ? "Authenticating..." : "Access Studio"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Quick Staff Credentials Selector for Testing & Verification */}
        <div className="pt-4 border-t border-[#222123] space-y-2">
          <p className="text-[11px] font-mono uppercase text-[#6e6f77] text-center">
            Quick 1-Click Role Testing
          </p>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <button
              onClick={() =>
                handleQuickLogin("superadmin@gospelforge.com", "ForgeAdmin#2026")
              }
              className="p-2 rounded-lg bg-[#181719] hover:bg-[#222123] text-left border border-[#2a2929] text-red-300 transition-colors"
            >
              <span className="font-bold block">Marcus (Super Admin)</span>
              <span className="text-[#6e6f77]">Full System Rights</span>
            </button>

            <button
              onClick={() =>
                handleQuickLogin("admin@gospelforge.com", "ForgeAdmin#2026")
              }
              className="p-2 rounded-lg bg-[#181719] hover:bg-[#222123] text-left border border-[#2a2929] text-[#ffb13b] transition-colors"
            >
              <span className="font-bold block">Sarah (Admin)</span>
              <span className="text-[#6e6f77]">Can Publish Episodes</span>
            </button>

            <button
              onClick={() =>
                handleQuickLogin("editor@gospelforge.com", "ForgeEditor#2026")
              }
              className="p-2 rounded-lg bg-[#181719] hover:bg-[#222123] text-left border border-[#2a2929] text-blue-300 transition-colors"
            >
              <span className="font-bold block">Ethan (Editor)</span>
              <span className="text-[#6e6f77]">Drafts & Media Only</span>
            </button>

            <button
              onClick={() =>
                handleQuickLogin("listener@gospelforge.com", "Faith#2026")
              }
              className="p-2 rounded-lg bg-[#181719] hover:bg-[#222123] text-left border border-[#2a2929] text-gray-400 transition-colors"
            >
              <span className="font-bold block">Daniel (Listener)</span>
              <span className="text-[#6e6f77]">Test Access Denial</span>
            </button>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-[#6e6f77] hover:text-white transition-colors"
          >
            ← Return to Public Streaming
          </Link>
        </div>
      </div>
    </div>
  );
}
