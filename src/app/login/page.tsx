"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Search,
  Headphones,
  Heart,
  Users,
  ShieldCheck,
  Smartphone,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AccountLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      router.push("/");
    } else {
      setError(res.error || "Login failed. Please check your email and password.");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#080706] text-[#f5f0ea] overflow-x-hidden flex flex-col justify-between select-none">
      {/* 1. BACKGROUND ENVIRONMENT WITH VOLCANIC STONE PATH & GOLDEN CROSS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Image
          src="/images/signin-bg-volcanic.jpg"
          alt="Gospel Forge Sanctuary"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Subtle dark vignette overlay */}
        <div className="absolute inset-0 bg-[#080706]/40 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080706] via-transparent to-[#080706]/70" />
      </div>

      {/* 2. TOP NAVIGATION HEADER */}
      <header className="relative z-20 h-16 sm:h-20 px-4 md:px-10 flex items-center justify-between gap-4 border-b border-[#222025]/40 backdrop-blur-md">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-[#ff4500]/60 shadow-[0_0_15px_rgba(255,69,0,0.4)]">
            <Image
              src="/images/gospel-forge-emblem.jpg"
              alt="Gospel Forge"
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          </div>
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

        {/* Right Search Input & Auth Controls */}
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
            className="text-xs font-semibold text-[#ff4500] px-2 py-1"
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

      {/* 3. MAIN TWO-COLUMN SPLIT CONTAINER */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-10 py-6 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* LEFT COLUMN: BRAND EPIGRAPH & VALUE STATEMENT */}
        <div className="lg:col-span-5 space-y-6 hidden lg:block">
          <div className="space-y-2.5">
            <p className="font-mono text-[10px] text-[#ff4500] font-bold tracking-[0.25em] uppercase">
              THE GOSPEL AUDIO UNIVERSE
            </p>
            <h1 className="font-heading text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
              SAME
              <br />
              FAITH.
              <br />
              <span className="text-[#ff4500] text-glow-molten">NEW</span>
              <br />
              <span className="text-[#ff4500] text-glow-molten">FREQUENCIES.</span>
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-[#a5a6af] leading-relaxed font-sans max-w-md">
            Sign in to continue your journey, pick up where you left off, and stay connected with the Gospel Forge community.
          </p>

          {/* 3 Feature Badges Row */}
          <div className="flex items-center gap-8 pt-4">
            <div className="flex flex-col items-center gap-2 group cursor-default text-center">
              <div className="p-2.5 rounded-xl bg-[#161418] border border-[#2a282e] text-[#a5a6af] group-hover:text-[#ff4500] group-hover:border-[#ff4500]/40 transition-colors">
                <Headphones className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-[#8e8d94] max-w-[80px] leading-tight font-medium">
                Your Library Everywhere
              </span>
            </div>

            <div className="flex flex-col items-center gap-2 group cursor-default text-center">
              <div className="p-2.5 rounded-xl bg-[#161418] border border-[#2a282e] text-[#a5a6af] group-hover:text-[#ff4500] group-hover:border-[#ff4500]/40 transition-colors">
                <Heart className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-[#8e8d94] max-w-[80px] leading-tight font-medium">
                Save &amp; Follow Your Favourites
              </span>
            </div>

            <div className="flex flex-col items-center gap-2 group cursor-default text-center">
              <div className="p-2.5 rounded-xl bg-[#161418] border border-[#2a282e] text-[#a5a6af] group-hover:text-[#ff4500] group-hover:border-[#ff4500]/40 transition-colors">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-[#8e8d94] max-w-[80px] leading-tight font-medium">
                Join the Conversation
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: THE FORGED GLASS SIGN IN CARD */}
        <div className="lg:col-span-7 flex justify-center lg:justify-end">
          <div className="w-full max-w-xl p-6 sm:p-10 rounded-3xl bg-[#0f0e11]/90 backdrop-blur-xl border border-[#ff4500]/30 shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-6">
            {/* Header info inside card */}
            <div className="text-center space-y-1">
              <p className="font-mono text-[10px] text-[#ff4500] font-bold tracking-[0.25em] uppercase">
                WELCOME BACK
              </p>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Sign In to <span className="text-[#ff4500]">Gospel Forge</span>
              </h2>
              <p className="text-xs text-[#a5a6af] font-sans">
                Continue listening, exploring, and growing with our community.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Top Social Login Buttons (Google & Apple placed at top as in image) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {}}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#151417] hover:bg-[#1e1d21] border border-[#262429] text-xs font-semibold text-white transition-all shadow-sm"
              >
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

              <button
                type="button"
                onClick={() => {}}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#151417] hover:bg-[#1e1d21] border border-[#262429] text-xs font-semibold text-white transition-all shadow-sm"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 1.01-2.87-.96.04-2.12.64-2.8 1.44-.59.69-1.11 1.76-.97 2.8 1.07.08 2.14-.62 2.76-1.37z" />
                </svg>
                <span className="truncate">Continue with Apple</span>
              </button>
            </div>

            {/* Divider 'or' */}
            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-[#222125] w-full" />
              <span className="bg-[#0f0e11] px-3 text-xs text-[#6e6f77] shrink-0 font-sans">
                or
              </span>
            </div>

            {/* Sign In Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e6f77]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#131215] text-xs sm:text-sm text-white placeholder-[#6e6f77] pl-10 pr-3.5 py-3 rounded-xl border border-[#262429] focus:border-[#ff4500] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e6f77]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-[#131215] text-xs sm:text-sm text-white placeholder-[#6e6f77] pl-10 pr-10 py-3 rounded-xl border border-[#262429] focus:border-[#ff4500] focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6e6f77] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex justify-end pt-0.5">
                  <Link
                    href="/forgot-password"
                    className="text-[11px] text-[#ff4500] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Primary Action Button: Sign In -> */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#ff4500] to-[#e63900] text-white font-heading font-bold text-xs sm:text-sm tracking-wide shadow-[0_0_25px_rgba(255,69,0,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? "Signing In..." : "Sign In"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Switcher: Don't have an account? Create Account */}
            <p className="text-xs text-[#a5a6af] text-center pt-2">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-[#ff4500] font-bold hover:underline transition-colors"
              >
                Create Account
              </Link>
            </p>

            {/* Three Trust Badges at Bottom of Card */}
            <div className="pt-4 border-t border-[#222125] grid grid-cols-3 gap-2 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#8e8d94]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#ff4500] shrink-0" />
                <span>Secure and private</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#8e8d94]">
                <Smartphone className="w-3.5 h-3.5 text-[#ff4500] shrink-0" />
                <span>Access on all devices</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#8e8d94]">
                <Users className="w-3.5 h-3.5 text-[#ff4500] shrink-0" />
                <span>One account for everything</span>
              </div>
            </div>
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
