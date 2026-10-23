"use client";

import React, { useState } from "react";
import { GospelForgeEmblem } from "@/components/brand/GospelForgeEmblem";
import { VolcanicSummitCathedral } from "@/components/brand/VolcanicSummitCathedral";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Headphones,
  Mic,
  CheckCircle2,
  Circle,
  Search,
  BookOpen,
  BarChart2,
  Heart,
  Users,
  Flame,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AccountRegistrationPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [accountType, setAccountType] = useState<"listener" | "artist">("listener");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Artist specific optional fields
  const [ministryName, setMinistryName] = useState("");
  const [sampleLink, setSampleLink] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || firstName || "Believer";

    const res = await signup(
      email,
      password,
      fullName,
      accountType,
      accountType === "artist" ? { ministryName, sampleLink } : undefined
    );

    setIsSubmitting(false);

    if (res.success) {
      router.push("/");
    } else {
      setError(res.error || "Registration failed. Please check your details.");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#080706] text-[#f5f0ea] overflow-x-hidden flex flex-col justify-between select-none">
      {/* 1. BACKGROUND CATHEDRAL & MOLTEN DAIS ENVIRONMENT */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <VolcanicSummitCathedral intensity="hero" />
        <div className="absolute inset-0 bg-[#080706]/40 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080706] via-transparent to-[#080706]/70" />
      </div>

      {/* 2. TOP NAVIGATION HEADER (Matching reference image) */}
      <header className="relative z-20 h-16 sm:h-20 px-4 md:px-10 flex items-center justify-between gap-4 border-b border-[#222025]/40 backdrop-blur-md">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <GospelForgeEmblem className="w-9 h-9 sm:w-10 sm:h-10 group-hover:scale-105 transition-transform" />
          <span className="font-heading font-extrabold text-sm sm:text-base tracking-wider text-white">
            GOSPEL <span className="text-[#ff4500]">FORGE</span>
          </span>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden xl:flex items-center gap-7 text-xs font-semibold text-[#a5a6af]">
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

        {/* Right Search Input & Auth Buttons */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative hidden md:block w-56 lg:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6e6f77]" />
            <input
              type="text"
              placeholder="Search episodes, topics, or creators..."
              className="w-full bg-[#121114]/90 text-xs text-[#f5f0ea] placeholder-[#6e6f77] pl-9 pr-3 py-2 rounded-xl border border-[#262429] focus:border-[#ff4500] focus:outline-none"
            />
          </div>

          <Link
            href="/login"
            className="text-xs font-semibold text-[#f5f0ea] hover:text-[#ff4500] transition-colors px-2 py-1"
          >
            Sign In
          </Link>

          <Link
            href="/signup"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff4500] to-[#e63900] text-white text-xs font-heading font-bold shadow-[0_0_15px_rgba(255,69,0,0.5)] hover:scale-105 active:scale-95 transition-all"
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* 3. MAIN THREE-COLUMN CONTENT CONTAINER */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-10 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* LEFT COLUMN: BRAND EPIGRAPH & VALUE PROPS */}
        <div className="lg:col-span-3 space-y-6 hidden lg:block">
          <div className="space-y-2">
            <p className="font-mono text-[10px] text-[#ff4500] font-bold tracking-[0.25em] uppercase">
              MORE THAN AUDIO
            </p>
            <h2 className="font-heading text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
              FAITH
              <br />
              CULTURE
              <br />
              LIFE
              <br />
              <span className="text-[#ff4500] text-glow-molten">PURPOSE</span>
            </h2>
          </div>

          <p className="text-xs text-[#a5a6af] leading-relaxed font-sans max-w-xs">
            Join a global community discovering Christ through real conversations, powerful stories, and life-changing truths.
          </p>

          {/* 3 Feature Badges */}
          <div className="flex items-center gap-6 pt-4 text-center">
            <div className="flex flex-col items-center gap-1.5 group cursor-default">
              <div className="p-2.5 rounded-xl bg-[#181619] border border-[#2a282e] text-[#a5a6af] group-hover:text-[#ff4500] group-hover:border-[#ff4500]/40 transition-colors">
                <Headphones className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-[#6e6f77] max-w-[65px] leading-tight">
                Listen Anywhere
              </span>
            </div>

            <div className="flex flex-col items-center gap-1.5 group cursor-default">
              <div className="p-2.5 rounded-xl bg-[#181619] border border-[#2a282e] text-[#a5a6af] group-hover:text-[#ffb13b] group-hover:border-[#ffb13b]/40 transition-colors">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-[#6e6f77] max-w-[65px] leading-tight">
                Join the Community
              </span>
            </div>

            <div className="flex flex-col items-center gap-1.5 group cursor-default">
              <div className="p-2.5 rounded-xl bg-[#181619] border border-[#2a282e] text-[#a5a6af] group-hover:text-[#ff4500] group-hover:border-[#ff4500]/40 transition-colors">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-[#6e6f77] max-w-[70px] leading-tight">
                Follow Your Favourite Creators
              </span>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: THE FORGED GLASS REGISTRATION CARD */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#0f0e11]/90 backdrop-blur-xl border border-[#ff4500]/30 shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-5">
            {/* Header info inside card */}
            <div className="text-center space-y-1">
              <p className="font-mono text-[10px] text-[#ff4500] font-bold tracking-[0.25em] uppercase">
                CREATE YOUR ACCOUNT
              </p>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Join <span className="text-[#ff4500]">Gospel Forge</span>
              </h1>
              <p className="text-xs text-[#a5a6af] font-sans">
                How would you like to use the platform?
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Two Side-by-Side Role Choice Cards (Listener vs Artist) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Listener */}
              <div
                onClick={() => setAccountType("listener")}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between relative group ${
                  accountType === "listener"
                    ? "bg-[#171212] border-2 border-[#ff4500] shadow-[0_0_20px_rgba(255,69,0,0.3)]"
                    : "bg-[#121114] border-[#252429] hover:border-[#ff4500]/40"
                }`}
              >
                {/* Radio Circle Top Right */}
                <div className="absolute top-3 right-3 text-[#ff4500]">
                  {accountType === "listener" ? (
                    <CheckCircle2 className="w-4 h-4 fill-[#ff4500] text-black" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#3a3940]" />
                  )}
                </div>

                <div className="flex flex-col items-center text-center space-y-2 pt-1">
                  <div className="p-2.5 rounded-full bg-[#ff4500]/10 text-[#ff4500]">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading text-xs sm:text-sm font-bold text-white">
                    I&apos;m here to listen
                  </h3>
                  <p className="text-[10px] text-[#a5a6af] leading-relaxed">
                    Discover podcasts, save episodes, create playlists, and join a growing community.
                  </p>
                </div>
              </div>

              {/* Option 2: Artist or Creator */}
              <div
                onClick={() => setAccountType("artist")}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between relative group ${
                  accountType === "artist"
                    ? "bg-[#171212] border-2 border-[#ff4500] shadow-[0_0_20px_rgba(255,69,0,0.3)]"
                    : "bg-[#121114] border-[#252429] hover:border-[#ff4500]/40"
                }`}
              >
                {/* Radio Circle Top Right */}
                <div className="absolute top-3 right-3 text-[#ff4500]">
                  {accountType === "artist" ? (
                    <CheckCircle2 className="w-4 h-4 fill-[#ff4500] text-black" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#3a3940]" />
                  )}
                </div>

                <div className="flex flex-col items-center text-center space-y-2 pt-1">
                  <div className="p-2.5 rounded-full bg-[#ffb13b]/10 text-[#ffb13b]">
                    <Mic className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading text-xs sm:text-sm font-bold text-white">
                    I&apos;m an artist or creator
                  </h3>
                  <p className="text-[10px] text-[#a5a6af] leading-relaxed">
                    Apply to publish podcasts on Gospel Forge and share your voice with the world.
                  </p>
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Name Row: First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e6f77]" />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="w-full bg-[#131215] text-xs text-white placeholder-[#6e6f77] pl-10 pr-3.5 py-3 rounded-xl border border-[#262429] focus:border-[#ff4500] focus:outline-none transition-all"
                  />
                </div>

                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e6f77]" />
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className="w-full bg-[#131215] text-xs text-white placeholder-[#6e6f77] pl-10 pr-3.5 py-3 rounded-xl border border-[#262429] focus:border-[#ff4500] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e6f77]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full bg-[#131215] text-xs text-white placeholder-[#6e6f77] pl-10 pr-3.5 py-3 rounded-xl border border-[#262429] focus:border-[#ff4500] focus:outline-none transition-all"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e6f77]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-[#131215] text-xs text-white placeholder-[#6e6f77] pl-10 pr-10 py-3 rounded-xl border border-[#262429] focus:border-[#ff4500] focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6e6f77] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Optional Artist Fields if Artist selected */}
              {accountType === "artist" && (
                <div className="space-y-3 pt-1 border-t border-[#262429]/60 animate-in fade-in">
                  <input
                    type="text"
                    value={ministryName}
                    onChange={(e) => setMinistryName(e.target.value)}
                    placeholder="Ministry or Creator Name"
                    className="w-full bg-[#131215] text-xs text-white placeholder-[#6e6f77] px-3.5 py-2.5 rounded-xl border border-[#262429] focus:border-[#ff4500] focus:outline-none"
                  />
                  <input
                    type="url"
                    value={sampleLink}
                    onChange={(e) => setSampleLink(e.target.value)}
                    placeholder="Sample Audio, Podcast, or Video Link (URL)"
                    className="w-full bg-[#131215] text-xs text-white placeholder-[#6e6f77] px-3.5 py-2.5 rounded-xl border border-[#262429] focus:border-[#ff4500] focus:outline-none"
                  />
                </div>
              )}

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#ff4500] to-[#e63900] text-white font-heading font-bold text-xs sm:text-sm tracking-wide shadow-[0_0_25px_rgba(255,69,0,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Creating Your Account..." : "Create Account"}
              </button>
            </form>

            {/* Social Logins Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-[#222125] w-full" />
              <span className="bg-[#0f0e11] px-3 text-[10px] font-mono text-[#6e6f77] uppercase shrink-0">
                or continue with
              </span>
            </div>

            {/* Social Login Buttons: Google & Apple */}
            <div className="grid grid-cols-2 gap-3">
              {/* Google Button */}
              <button
                type="button"
                onClick={() => {}}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#151417] hover:bg-[#1e1d21] border border-[#262429] text-xs font-semibold text-white transition-all"
              >
                {/* Colored Google 'G' icon */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="truncate">Continue with Google</span>
              </button>

              {/* Apple Button */}
              <button
                type="button"
                onClick={() => {}}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#151417] hover:bg-[#1e1d21] border border-[#262429] text-xs font-semibold text-white transition-all"
              >
                {/* White Apple icon */}
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 1.01-2.87-.96.04-2.12.64-2.8 1.44-.59.69-1.11 1.76-.97 2.8 1.07.08 2.14-.62 2.76-1.37z" />
                </svg>
                <span className="truncate">Continue with Apple</span>
              </button>
            </div>

            {/* Terms of Service Disclaimer */}
            <p className="text-[10px] text-[#6e6f77] text-center leading-relaxed">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-[#ff4500] underline hover:text-[#ffb13b]">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#ff4500] underline hover:text-[#ffb13b]">
                Privacy Policy
              </Link>
              .
            </p>

            {/* Sign In Switcher */}
            <p className="text-xs text-[#a5a6af] text-center pt-1 border-t border-[#201f24]">
              Already have an account?{" "}
              <Link href="/login" className="text-[#ff4500] font-bold hover:text-[#ffb13b] transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: SPIRITUAL JOURNEY & 5 VALUE PROPS */}
        <div className="lg:col-span-3 space-y-6 hidden lg:block">
          <div className="space-y-1.5">
            <p className="font-mono text-[10px] text-[#ff4500] font-bold tracking-[0.25em] uppercase">
              ONE PLATFORM
            </p>
            <h2 className="font-heading text-2xl xl:text-3xl font-extrabold text-white tracking-tight leading-tight">
              A Deeper
              <br />
              <span className="text-[#ff4500]">Journey Together.</span>
            </h2>
            <p className="text-xs text-[#a5a6af] font-sans leading-relaxed">
              More than podcasts. A community built on faith, truth, and real conversations.
            </p>
          </div>

          {/* 5 Value Props List */}
          <div className="space-y-3.5">
            {/* 1. Powerful Podcasts */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#181619] border border-[#262429] text-[#ffb13b] shrink-0 mt-0.5">
                <Headphones className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-heading text-xs font-bold text-white">Powerful Podcasts</h4>
                <p className="text-[10px] text-[#a5a6af] leading-relaxed">
                  Listen to stories, teachings, and conversations that matter.
                </p>
              </div>
            </div>

            {/* 2. A Growing Community */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#181619] border border-[#262429] text-[#ff4500] shrink-0 mt-0.5">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-heading text-xs font-bold text-white">A Growing Community</h4>
                <p className="text-[10px] text-[#a5a6af] leading-relaxed">
                  Connect with believers around the world.
                </p>
              </div>
            </div>

            {/* 3. Rooted in Scripture */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#181619] border border-[#262429] text-[#ffb13b] shrink-0 mt-0.5">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-heading text-xs font-bold text-white">Rooted in Scripture</h4>
                <p className="text-[10px] text-[#a5a6af] leading-relaxed">
                  Real truth for real life.
                </p>
              </div>
            </div>

            {/* 4. Discover New Voices */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#181619] border border-[#262429] text-[#ff4500] shrink-0 mt-0.5">
                <BarChart2 className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-heading text-xs font-bold text-white">Discover New Voices</h4>
                <p className="text-[10px] text-[#a5a6af] leading-relaxed">
                  Explore creators, ministries, and fresh perspectives.
                </p>
              </div>
            </div>

            {/* 5. Follow & Save */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#181619] border border-[#262429] text-[#ffb13b] shrink-0 mt-0.5">
                <Heart className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-heading text-xs font-bold text-white">Follow &amp; Save</h4>
                <p className="text-[10px] text-[#a5a6af] leading-relaxed">
                  Build your personal library and never miss an episode.
                </p>
              </div>
            </div>
          </div>

          {/* Scripture Callout in Cinzel */}
          <div className="pt-2 border-t border-[#201f24] space-y-1">
            <blockquote className="font-cinzel text-xs text-[#d0cfd6] italic leading-relaxed">
              &ldquo;So faith comes from hearing, and hearing through the word of Christ.&rdquo;
            </blockquote>
            <p className="font-mono text-[10px] text-[#ff4500] font-bold">
              ROMANS 10:17
            </p>
          </div>
        </div>
      </main>

      {/* 4. FOOTER BASELINE */}
      <footer className="relative z-10 py-4 text-center text-[10px] font-mono text-[#6e6f77] border-t border-[#1a191d]/50">
        © 2026 GOSPEL FORGE. ALL RIGHTS RESERVED. FAITH HAS A FREQUENCY.
      </footer>
    </div>
  );
}
