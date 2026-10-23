"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Headphones,
  Mic,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function PublicSignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [step, setStep] = useState<"choice" | "form">("choice");
  const [accountType, setAccountType] = useState<"listener" | "artist">("listener");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ministryName, setMinistryName] = useState("");
  const [bio, setBio] = useState("");
  const [sampleLink, setSampleLink] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
      router.push("/");
    } else {
      setError(res.error || "Signup failed.");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-3xl bg-[#111113] border border-[#262527] shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="relative w-14 h-14 mx-auto rounded-full overflow-hidden border border-[#ff4500]/50 shadow-[0_0_15px_rgba(255,69,0,0.4)]">
            <Image
              src="/images/gospel-forge-emblem.jpg"
              alt="Gospel Forge"
              fill
              className="object-cover"
            />
          </div>
          <h1 className="font-heading text-2xl font-bold text-white">
            Join Gospel Forge
          </h1>
          <p className="text-xs text-[#a5a6af] font-body">
            Faith has a frequency. Create your account to start.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: CHOICE (Option 1: Listener vs Option 2: Artist) */}
        {step === "choice" && (
          <div className="space-y-4">
            <p className="text-xs font-mono text-[#ffb13b] uppercase tracking-wider font-semibold text-center">
              Choose Account Purpose
            </p>

            <div
              onClick={() => {
                setAccountType("listener");
                setStep("form");
              }}
              className="p-5 rounded-2xl bg-[#161517] hover:bg-[#1e1d20] border border-[#262527] hover:border-[#ff4500]/50 transition-all cursor-pointer flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#ff4500]/15 text-[#ff4500] flex items-center justify-center shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-white group-hover:text-[#ffb13b] transition-colors">
                  Option 1: I&apos;m here to listen.
                </h3>
                <p className="text-xs text-[#a5a6af] mt-0.5">
                  Stream podcasts, save episodes, curate playlists, and follow speakers.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#6e6f77] group-hover:text-white" />
            </div>

            <div
              onClick={() => {
                setAccountType("artist");
                setStep("form");
              }}
              className="p-5 rounded-2xl bg-[#161517] hover:bg-[#1e1d20] border border-[#262527] hover:border-[#ff4500]/50 transition-all cursor-pointer flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                <Mic className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-white group-hover:text-[#ffb13b] transition-colors">
                  Option 2: I&apos;m an artist or creator.
                </h3>
                <p className="text-xs text-[#a5a6af] mt-0.5">
                  Apply to publish original sermons, worship songs, or podcasts to the platform.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#6e6f77] group-hover:text-white" />
            </div>
          </div>
        )}

        {/* STEP 2: REGISTRATION FORM */}
        {step === "form" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#222123]">
              <span className="text-xs font-mono text-[#ffb13b] uppercase">
                {accountType === "artist" ? "Artist Application" : "Listener Registration"}
              </span>
              <button
                type="button"
                onClick={() => setStep("choice")}
                className="text-[11px] text-[#6e6f77] hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Change</span>
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-[#a5a6af]">Full Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-[#6e6f77]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Daniel Cole"
                  className="w-full bg-[#181719] text-sm text-white placeholder-[#6e6f77] pl-10 pr-4 py-2.5 rounded-xl border border-[#2a2929] focus:border-[#ff4500] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-[#a5a6af]">Email</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-[#6e6f77]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full bg-[#181719] text-sm text-white placeholder-[#6e6f77] pl-10 pr-4 py-2.5 rounded-xl border border-[#2a2929] focus:border-[#ff4500] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-[#a5a6af]">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-[#6e6f77]" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-[#181719] text-sm text-white placeholder-[#6e6f77] pl-10 pr-4 py-2.5 rounded-xl border border-[#2a2929] focus:border-[#ff4500] focus:outline-none"
                />
              </div>
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
                    className="w-full bg-[#181719] text-sm text-white placeholder-[#6e6f77] px-4 py-2.5 rounded-xl border border-[#2a2929] focus:border-[#ff4500] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-[#a5a6af]">Sample Audio Link</label>
                  <input
                    type="url"
                    value={sampleLink}
                    onChange={(e) => setSampleLink(e.target.value)}
                    placeholder="https://soundcloud.com/..."
                    className="w-full bg-[#181719] text-sm text-white placeholder-[#6e6f77] px-4 py-2.5 rounded-xl border border-[#2a2929] focus:border-[#ff4500] focus:outline-none"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#ff4500] to-[#ffb13b] text-black font-heading font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              <span>
                {isSubmitting
                  ? "Submitting..."
                  : accountType === "artist"
                  ? "Submit Application"
                  : "Create Free Account"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center text-xs text-[#a5a6af] pt-2 border-t border-[#222123]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#ff4500] font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
