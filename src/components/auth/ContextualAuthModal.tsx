"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  Lock,
  Mail,
  User,
  Headphones,
  Mic,
  ArrowRight,
  Flame,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { cn } from "@/lib/utils";

export function ContextualAuthModal() {
  const {
    isAuthModalOpen,
    authModalConfig,
    closeAuthModal,
    login,
    signup,
    pendingAction,
    clearPendingAction,
  } = useAuth();

  const { toggleSaveEpisode } = useAudioPlayer();

  const [mode, setMode] = useState<"options" | "login" | "signup_choice" | "signup_form">("options");
  const [accountType, setAccountType] = useState<"listener" | "artist">("listener");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [ministryName, setMinistryName] = useState("");
  const [bio, setBio] = useState("");
  const [sampleLink, setSampleLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen || !authModalConfig) return null;

  // Execute and resume pending action after successful authentication
  const executePendingAction = () => {
    if (pendingAction) {
      if (pendingAction.type === "save_episode") {
        toggleSaveEpisode(pendingAction.episodeId);
      }
      clearPendingAction();
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      executePendingAction();
      closeAuthModal();
    } else {
      setError(res.error || "Authentication failed.");
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await signup(
      email,
      password,
      name,
      accountType,
      accountType === "artist" ? { ministryName, bio, sampleLink } : undefined
    );
    setIsSubmitting(false);

    if (res.success) {
      executePendingAction();
      closeAuthModal();
    } else {
      setError(res.error || "Failed to create account.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop (Does not pause audio!) */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in"
        onClick={closeAuthModal}
      />

      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#111113] border border-[#ff4500]/40 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 animate-in zoom-in-95 duration-200">
        {/* Close "Not Now" Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#a5a6af] hover:text-white hover:bg-[#1c1b1b] transition-colors"
          title="Not Now"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Pill */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#ff4500]/50">
            <Image
              src="/images/gospel-forge-emblem.jpg"
              alt="Gospel Forge"
              fill
              className="object-cover"
            />
          </div>
          <span className="font-heading font-bold text-xs tracking-wider text-white">
            GOSPEL <span className="text-[#ff4500]">FORGE</span>
          </span>
        </div>

        {/* Feature-Specific Headline & Context */}
        <div className="space-y-1 mb-6">
          <h2 className="font-heading text-2xl font-bold text-white">
            {authModalConfig.title}
          </h2>
          <p className="text-xs text-[#a5a6af] font-body leading-relaxed">
            {authModalConfig.description}
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 1: CHOICE OPTIONS (Create Account vs Sign In) */}
        {/* ========================================================= */}
        {mode === "options" && (
          <div className="space-y-3">
            <button
              onClick={() => setMode("signup_choice")}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#ff4500] to-[#ffb13b] text-black font-heading font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,69,0,0.5)] hover:scale-105 active:scale-95 transition-all"
            >
              Create Free Account
            </button>

            <button
              onClick={() => setMode("login")}
              className="w-full py-3.5 rounded-full bg-[#181719] hover:bg-[#201f22] border border-[#2a2929] text-xs font-semibold text-white transition-colors"
            >
              Sign In to Existing Account
            </button>

            <button
              onClick={closeAuthModal}
              className="w-full py-2 text-xs font-mono text-[#6e6f77] hover:text-white transition-colors text-center block pt-2"
            >
              Not Now (Continue Listening)
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: SIGNUP CHOICE (Listener vs Artist) */}
        {/* ========================================================= */}
        {mode === "signup_choice" && (
          <div className="space-y-4">
            <p className="text-xs font-mono text-[#ffb13b] uppercase tracking-wider font-semibold">
              Select Your Intended Account Type:
            </p>

            {/* Option 1: Listener */}
            <div
              onClick={() => {
                setAccountType("listener");
                setMode("signup_form");
              }}
              className="p-4 rounded-2xl bg-[#161517] hover:bg-[#1e1d20] border border-[#262527] hover:border-[#ff4500]/50 transition-all cursor-pointer flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#ff4500]/15 text-[#ff4500] flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-white group-hover:text-[#ffb13b] transition-colors">
                  Option 1: I&apos;m here to listen
                </h4>
                <p className="text-xs text-[#a5a6af] mt-0.5">
                  Stream podcasts, save episodes, create playlists, and join discussions.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#6e6f77] group-hover:text-white" />
            </div>

            {/* Option 2: Artist / Creator */}
            <div
              onClick={() => {
                setAccountType("artist");
                setMode("signup_form");
              }}
              className="p-4 rounded-2xl bg-[#161517] hover:bg-[#1e1d20] border border-[#262527] hover:border-[#ff4500]/50 transition-all cursor-pointer flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                <Mic className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-white group-hover:text-[#ffb13b] transition-colors">
                  Option 2: I&apos;m an artist or creator
                </h4>
                <p className="text-xs text-[#a5a6af] mt-0.5">
                  Submit podcast or worship music for review to publish on Gospel Forge.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#6e6f77] group-hover:text-white" />
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setMode("options")}
                className="text-xs text-[#6e6f77] hover:text-white"
              >
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: SIGNUP FORM */}
        {/* ========================================================= */}
        {mode === "signup_form" && (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-[#222123]">
              <span className="text-xs font-mono text-[#ffb13b] uppercase">
                {accountType === "artist" ? "Artist Application" : "Listener Registration"}
              </span>
              <button
                type="button"
                onClick={() => setMode("signup_choice")}
                className="text-[11px] text-[#6e6f77] hover:text-white"
              >
                Change type
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-[#a5a6af]">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="David Cole"
                className="w-full bg-[#181719] text-xs text-white p-2.5 rounded-xl border border-[#262527] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-[#a5a6af]">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-[#181719] text-xs text-white p-2.5 rounded-xl border border-[#262527] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-[#a5a6af]">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#181719] text-xs text-white p-2.5 rounded-xl border border-[#262527] focus:outline-none"
              />
            </div>

            {accountType === "artist" && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-mono text-[#a5a6af]">Ministry / Show Name</label>
                  <input
                    type="text"
                    required
                    value={ministryName}
                    onChange={(e) => setMinistryName(e.target.value)}
                    placeholder="e.g. Stone Altar Ministries"
                    className="w-full bg-[#181719] text-xs text-white p-2.5 rounded-xl border border-[#262527] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono text-[#a5a6af]">Sample Audio Link</label>
                  <input
                    type="url"
                    value={sampleLink}
                    onChange={(e) => setSampleLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#181719] text-xs text-white p-2.5 rounded-xl border border-[#262527] focus:outline-none"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#ff4500] to-[#ffb13b] text-black font-heading font-bold text-xs uppercase tracking-wider shadow-lg disabled:opacity-50 mt-2"
            >
              {isSubmitting
                ? "Submitting..."
                : accountType === "artist"
                ? "Submit Artist Application"
                : "Complete Registration"}
            </button>
          </form>
        )}

        {/* ========================================================= */}
        {/* VIEW 4: LOGIN FORM */}
        {/* ========================================================= */}
        {mode === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-mono text-[#a5a6af]">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-[#181719] text-xs text-white p-2.5 rounded-xl border border-[#262527] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-[#a5a6af]">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#181719] text-xs text-white p-2.5 rounded-xl border border-[#262527] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#ff4500] to-[#ffb13b] text-black font-heading font-bold text-xs uppercase tracking-wider shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? "Signing In..." : "Sign In & Continue"}
            </button>

            {/* Quick 1-click test selector for testing inside modal */}
            <div className="pt-2 border-t border-[#222123] text-center">
              <button
                type="button"
                onClick={() => {
                  setEmail("listener@gospelforge.com");
                  setPassword("Faith#2026");
                }}
                className="text-[10px] font-mono text-[#ffb13b] hover:underline"
              >
                Auto-fill test listener credentials
              </button>
            </div>

            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => setMode("options")}
                className="text-xs text-[#6e6f77] hover:text-white"
              >
                ← Back to options
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
