"use client";

import React, { useState } from "react";
import Image from "next/image";
import { GospelForgeEmblem } from "@/components/brand/GospelForgeEmblem";
import { VolcanicSummitCathedral } from "@/components/brand/VolcanicSummitCathedral";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Camera,
  ArrowRight,
  ArrowLeft,
  Headphones,
  Mic,
  BarChart2,
  Users,
  Heart,
  Search,
  Bell,
  CheckCircle2,
  UploadCloud,
  FileCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ArtistOnboardingPage() {
  const router = useRouter();
  const { currentUser, submitArtistApplication } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  // Step 1: Basic Information
  const [fullName, setFullName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [displayName, setDisplayName] = useState(currentUser?.name || "");
  const [bio, setBio] = useState("");
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    currentUser?.avatarUrl || null
  );

  // Step 2: Ministry Details
  const [ministryName, setMinistryName] = useState("");
  const [ministryRole, setMinistryRole] = useState("Pastor / Teacher");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [location, setLocation] = useState("");

  // Step 3: Content Focus
  const [primaryTopic, setPrimaryTopic] = useState("Scripture Exposition");
  const [sampleLink, setSampleLink] = useState("");
  const [releaseCadence, setReleaseCadence] = useState("Weekly");

  // Step 4: Social Links
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [socialHandle, setSocialHandle] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfileImagePreview(url);
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleSubmitApplication();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmitApplication = async () => {
    setIsSubmitting(true);
    await submitArtistApplication({
      ministryName: ministryName || displayName,
      bio,
      sampleLink,
      socialLinks: {
        youtube: youtubeUrl,
        spotify: spotifyUrl,
        social: socialHandle,
      },
    });
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const steps = [
    { num: 1, title: "Basic Information" },
    { num: 2, title: "Ministry Details" },
    { num: 3, title: "Content Focus" },
    { num: 4, title: "Social Links" },
    { num: 5, title: "Review & Submit" },
  ];

  return (
    <div className="relative min-h-screen bg-[#080706] text-[#f5f0ea] overflow-x-hidden flex flex-col justify-between select-none">
      {/* 1. BACKGROUND CATHEDRAL ENVIRONMENT WITH ARTIST & SUMMIT CROSS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <VolcanicSummitCathedral intensity="hero" />
        <div className="absolute inset-0 bg-[#080706]/40 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080706] via-transparent to-[#080706]/70" />
      </div>

      {/* 2. TOP NAVIGATION HEADER */}
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

        {/* Right Search Input, Notification & User Avatar */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative hidden md:block w-56 lg:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6e6f77]" />
            <input
              type="text"
              placeholder="Search episodes, topics, or creators..."
              className="w-full bg-[#121114]/90 text-xs text-[#f5f0ea] placeholder-[#6e6f77] pl-9 pr-3 py-2 rounded-xl border border-[#262429] focus:border-[#ff4500] focus:outline-none"
            />
          </div>

          <button
            className="p-2 rounded-full bg-[#141316] text-[#a5a6af] hover:text-white relative border border-[#242327]"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ff4500] shadow-[0_0_6px_#ff4500]" />
          </button>

          <Link href="/profile" className="relative w-8 h-8 rounded-full overflow-hidden border border-[#ff4500]/50 shadow-sm">
            <Image
              src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"}
              alt="Creator Avatar"
              fill
              className="object-cover"
            />
          </Link>
        </div>
      </header>

      {/* 3. MAIN THREE-COLUMN ONBOARDING INTERFACE */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-10 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* COLUMN 1: LEFT SIDEBAR STEPPER */}
        <div className="lg:col-span-3 space-y-6">
          <div className="space-y-1">
            <h2 className="font-heading text-lg font-bold text-white tracking-wide">
              Artist Application
            </h2>
            <p className="text-xs text-[#a5a6af] font-sans">
              Share your voice. Make an impact.
            </p>
          </div>

          {/* Stepper List */}
          <div className="space-y-3 relative">
            {/* Connecting Vertical Line */}
            <div className="absolute left-[17px] top-4 bottom-4 w-0.5 bg-[#252329] z-0" />

            {steps.map((s) => {
              const isActive = currentStep === s.num;
              const isCompleted = currentStep > s.num;

              return (
                <div
                  key={s.num}
                  onClick={() => {
                    if (s.num <= currentStep) setCurrentStep(s.num);
                  }}
                  className={`flex items-center gap-3.5 p-2 rounded-2xl relative z-10 transition-all ${
                    isActive
                      ? "bg-[#18161a] border border-[#ff4500]/50 shadow-[0_0_15px_rgba(255,69,0,0.2)]"
                      : "opacity-80 hover:opacity-100"
                  } ${s.num <= currentStep ? "cursor-pointer" : "cursor-default"}`}
                >
                  {/* Step Number Circle */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-all ${
                      isActive
                        ? "bg-[#ff4500] text-black shadow-[0_0_10px_rgba(255,69,0,0.8)]"
                        : isCompleted
                        ? "bg-[#ffb13b] text-black"
                        : "bg-[#1f1e23] text-[#6e6f77] border border-[#2a2930]"
                    }`}
                  >
                    {isCompleted ? "✓" : s.num}
                  </div>

                  <span
                    className={`font-heading text-xs font-semibold tracking-wide ${
                      isActive
                        ? "text-white font-bold"
                        : isCompleted
                        ? "text-[#f5f0ea]"
                        : "text-[#6e6f77]"
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* "Already a listener?" Card at bottom of sidebar */}
          <div className="p-4 rounded-2xl bg-[#121114]/85 border border-[#262429] shadow-lg space-y-2 mt-8">
            <div className="flex items-center gap-2 text-[#ffb13b]">
              <Headphones className="w-4 h-4" />
              <h4 className="font-heading text-xs font-bold text-white">
                Already a listener?
              </h4>
            </div>
            <p className="text-[11px] text-[#a5a6af] leading-relaxed">
              You can still enjoy podcasts, save episodes, and join the community.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white hover:text-[#ff4500] pt-1 transition-colors group"
            >
              <span>Explore as Listener</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#ff4500] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* COLUMN 2: CENTER WIZARD FORM CARD */}
        <div className="lg:col-span-5">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0e0d10]/95 backdrop-blur-2xl border border-[#ff4500]/30 shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-6">
            {!isSubmitted ? (
              <>
                {/* Step Header */}
                <div className="space-y-1">
                  <p className="font-mono text-[10px] text-[#ff4500] font-bold tracking-[0.25em] uppercase">
                    STEP {currentStep} OF 5
                  </p>
                  <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {currentStep === 1 && (
                      <>
                        Tell Us About <span className="text-[#ff4500]">Yourself</span>
                      </>
                    )}
                    {currentStep === 2 && (
                      <>
                        Ministry &amp; <span className="text-[#ff4500]">Organization</span>
                      </>
                    )}
                    {currentStep === 3 && (
                      <>
                        Podcast &amp; <span className="text-[#ff4500]">Content Focus</span>
                      </>
                    )}
                    {currentStep === 4 && (
                      <>
                        Social &amp; <span className="text-[#ff4500]">Media Presence</span>
                      </>
                    )}
                    {currentStep === 5 && (
                      <>
                        Review &amp; <span className="text-[#ff4500]">Submit</span>
                      </>
                    )}
                  </h1>
                  <p className="text-xs text-[#a5a6af] font-sans">
                    {currentStep === 1 &&
                      "Let's start with some basic information about you and your ministry."}
                    {currentStep === 2 &&
                      "Share details regarding your church, ministry, or creative organization."}
                    {currentStep === 3 &&
                      "What kind of podcasts and messages will you broadcast on the frequency?"}
                    {currentStep === 4 &&
                      "Connect your existing channels so our staff can verify your public recordings."}
                    {currentStep === 5 &&
                      "Review your application before sending it to the Gospel Forge review committee."}
                  </p>
                </div>

                {/* Form Body for Current Step */}
                <form onSubmit={handleNext} className="space-y-4">
                  {/* STEP 1: Basic Information */}
                  {currentStep === 1 && (
                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-white block">
                          Full Name <span className="text-[#ff4500]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full bg-[#131215] text-xs sm:text-sm text-white placeholder-[#6e6f77] px-3.5 py-2.5 rounded-xl border border-[#262429] focus:border-[#ff4500] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-white block">
                          Email Address <span className="text-[#ff4500]">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e6f77]" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full bg-[#131215] text-xs sm:text-sm text-white placeholder-[#6e6f77] pl-10 pr-3.5 py-2.5 rounded-xl border border-[#262429] focus:border-[#ff4500] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-white block">
                          Display Name <span className="text-[#ff4500]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="This will be visible to your audience"
                          className="w-full bg-[#131215] text-xs sm:text-sm text-white placeholder-[#6e6f77] px-3.5 py-2.5 rounded-xl border border-[#262429] focus:border-[#ff4500] focus:outline-none"
                        />
                      </div>

                      {/* Profile Picture Upload Area */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-white block">
                          Profile Picture
                        </label>
                        <label className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-[#2d2b31] hover:border-[#ff4500]/50 bg-[#131215] cursor-pointer transition-colors group">
                          {profileImagePreview ? (
                            <div className="relative w-16 h-16 rounded-full overflow-hidden border border-[#ff4500]">
                              <Image
                                src={profileImagePreview}
                                alt="Preview"
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center text-center space-y-1">
                              <Camera className="w-6 h-6 text-[#a5a6af] group-hover:text-[#ff4500] transition-colors" />
                              <span className="text-xs font-semibold text-white">
                                Upload Photo
                              </span>
                              <span className="text-[10px] text-[#6e6f77]">
                                JPG, PNG or WebP (Max 5MB)
                              </span>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Short Bio Area */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-white block">
                          Short Bio <span className="text-[#ff4500]">*</span>
                        </label>
                        <textarea
                          required
                          maxLength={300}
                          rows={3}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell us a bit about yourself, your background, and your ministry journey..."
                          className="w-full bg-[#131215] text-xs text-white placeholder-[#6e6f77] p-3 rounded-xl border border-[#262429] focus:border-[#ff4500] focus:outline-none resize-none"
                        />
                        <div className="flex justify-end text-[10px] font-mono text-[#6e6f77]">
                          {bio.length}/300
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Ministry Details */}
                  {currentStep === 2 && (
                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-white block">
                          Ministry / Church / Organization Name <span className="text-[#ff4500]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={ministryName}
                          onChange={(e) => setMinistryName(e.target.value)}
                          placeholder="e.g. Grace Fellowship, Kingdom Forge Media"
                          className="w-full bg-[#131215] text-xs sm:text-sm text-white placeholder-[#6e6f77] px-3.5 py-2.5 rounded-xl border border-[#262429] focus:border-[#ff4500] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-white block">
                          Your Role / Title <span className="text-[#ff4500]">*</span>
                        </label>
                        <select
                          value={ministryRole}
                          onChange={(e) => setMinistryRole(e.target.value)}
                          className="w-full bg-[#131215] text-xs sm:text-sm text-white px-3.5 py-2.5 rounded-xl border border-[#262429] focus:border-[#ff4500] focus:outline-none"
                        >
                          <option>Pastor / Lead Minister</option>
                          <option>Worship Leader / Artist</option>
                          <option>Bible Teacher / Scholar</option>
                          <option>Evangelist / Itinerant Speaker</option>
                          <option>Christian Content Creator</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-white block">
                          Website or Ministry Link
                        </label>
                        <input
                          type="url"
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                          placeholder="https://yourministry.org"
                          className="w-full bg-[#131215] text-xs sm:text-sm text-white placeholder-[#6e6f77] px-3.5 py-2.5 rounded-xl border border-[#262429] focus:border-[#ff4500] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-white block">
                          Location (City, Country)
                        </label>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g. Dallas, TX, USA"
                          className="w-full bg-[#131215] text-xs sm:text-sm text-white placeholder-[#6e6f77] px-3.5 py-2.5 rounded-xl border border-[#262429] focus:border-[#ff4500] focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Content Focus */}
                  {currentStep === 3 && (
                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-white block">
                          Primary Content Theme <span className="text-[#ff4500]">*</span>
                        </label>
                        <select
                          value={primaryTopic}
                          onChange={(e) => setPrimaryTopic(e.target.value)}
                          className="w-full bg-[#131215] text-xs sm:text-sm text-white px-3.5 py-2.5 rounded-xl border border-[#262429] focus:border-[#ff4500] focus:outline-none"
                        >
                          <option>Scripture Exposition</option>
                          <option>Faith &amp; Theology</option>
                          <option>Christian Culture &amp; Apologetics</option>
                          <option>Worship &amp; Sacred Music</option>
                          <option>Discipleship &amp; Family</option>
                          <option>Youth &amp; Next Generation</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-white block">
                          Sample Audio / Video Link (URL) <span className="text-[#ff4500]">*</span>
                        </label>
                        <input
                          type="url"
                          required
                          value={sampleLink}
                          onChange={(e) => setSampleLink(e.target.value)}
                          placeholder="https://youtube.com/watch?v=... or Google Drive link"
                          className="w-full bg-[#131215] text-xs sm:text-sm text-white placeholder-[#6e6f77] px-3.5 py-2.5 rounded-xl border border-[#262429] focus:border-[#ff4500] focus:outline-none"
                        />
                        <p className="text-[10px] text-[#6e6f77]">
                          Provide a sermon recording, podcast episode, or teaching video for staff review.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-white block">
                          Anticipated Publishing Cadence
                        </label>
                        <select
                          value={releaseCadence}
                          onChange={(e) => setReleaseCadence(e.target.value)}
                          className="w-full bg-[#131215] text-xs sm:text-sm text-white px-3.5 py-2.5 rounded-xl border border-[#262429] focus:border-[#ff4500] focus:outline-none"
                        >
                          <option>Weekly Broadcast</option>
                          <option>Bi-Weekly</option>
                          <option>Monthly Series</option>
                          <option>Seasonal / Special Broadcasts</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Social Links */}
                  {currentStep === 4 && (
                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-white block">
                          YouTube Channel (Optional)
                        </label>
                        <input
                          type="url"
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                          placeholder="https://youtube.com/@yourchannel"
                          className="w-full bg-[#131215] text-xs sm:text-sm text-white placeholder-[#6e6f77] px-3.5 py-2.5 rounded-xl border border-[#262429] focus:border-[#ff4500] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-white block">
                          Spotify / Apple Podcast URL (Optional)
                        </label>
                        <input
                          type="url"
                          value={spotifyUrl}
                          onChange={(e) => setSpotifyUrl(e.target.value)}
                          placeholder="https://open.spotify.com/show/..."
                          className="w-full bg-[#131215] text-xs sm:text-sm text-white placeholder-[#6e6f77] px-3.5 py-2.5 rounded-xl border border-[#262429] focus:border-[#ff4500] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-white block">
                          Social Media Handle (Instagram or X)
                        </label>
                        <input
                          type="text"
                          value={socialHandle}
                          onChange={(e) => setSocialHandle(e.target.value)}
                          placeholder="@yourministry"
                          className="w-full bg-[#131215] text-xs sm:text-sm text-white placeholder-[#6e6f77] px-3.5 py-2.5 rounded-xl border border-[#262429] focus:border-[#ff4500] focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 5: Review & Submit */}
                  {currentStep === 5 && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-[#131215] border border-[#262429] space-y-2 text-xs">
                        <div className="flex justify-between border-b border-[#201f24] pb-2">
                          <span className="text-[#a5a6af]">Creator Name:</span>
                          <span className="text-white font-semibold">{fullName}</span>
                        </div>
                        <div className="flex justify-between border-b border-[#201f24] pb-2">
                          <span className="text-[#a5a6af]">Ministry / Org:</span>
                          <span className="text-white font-semibold">{ministryName || "Independent"}</span>
                        </div>
                        <div className="flex justify-between border-b border-[#201f24] pb-2">
                          <span className="text-[#a5a6af]">Content Theme:</span>
                          <span className="text-[#ffb13b] font-semibold">{primaryTopic}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#a5a6af]">Sample Link:</span>
                          <span className="text-[#ff4500] truncate max-w-[180px]">{sampleLink}</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#161213] border border-[#ff4500]/30 text-[11px] text-[#f5f0ea] leading-relaxed">
                        By submitting this application, I affirm that my content aligns with the Gospel of Jesus Christ and historic biblical truth.
                      </div>
                    </div>
                  )}

                  {/* Action Buttons Row */}
                  <div className="flex items-center gap-3 pt-2">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="px-4 py-3 rounded-xl bg-[#161518] hover:bg-[#1e1d21] border border-[#28272c] text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#ff4500] to-[#e63900] text-white font-heading font-bold text-xs sm:text-sm tracking-wide shadow-[0_0_25px_rgba(255,69,0,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {currentStep === 1 && (
                        <>
                          <span>Continue to Ministry Details</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                      {currentStep === 2 && (
                        <>
                          <span>Continue to Content Focus</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                      {currentStep === 3 && (
                        <>
                          <span>Continue to Social Links</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                      {currentStep === 4 && (
                        <>
                          <span>Review Application</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                      {currentStep === 5 && (
                        <span>{isSubmitting ? "Submitting Application..." : "Submit Application"}</span>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Success / Pending Confirmation Card */
              <div className="text-center space-y-4 py-6 animate-in fade-in">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#ff4500]/20 text-[#ff4500] flex items-center justify-center border-2 border-[#ff4500] shadow-[0_0_25px_rgba(255,69,0,0.5)]">
                  <FileCheck className="w-8 h-8" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-white">
                  Application Submitted
                </h3>
                <p className="text-xs text-[#a5a6af] max-w-sm mx-auto leading-relaxed">
                  Thank you, <span className="text-white font-semibold">{fullName}</span>. Your artist application is now under review by our pastoral committee. We typically respond within 24–48 hours.
                </p>
                <div className="pt-2">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#ff4500] to-[#e63900] text-white text-xs font-heading font-bold shadow-lg"
                  >
                    <span>Return to Home</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: RIGHT CREATOR VALUE & HERO STATEMENTS */}
        <div className="lg:col-span-4 space-y-6 hidden lg:block">
          <div className="space-y-1.5">
            <p className="font-mono text-[10px] text-[#ff4500] font-bold tracking-[0.25em] uppercase">
              FOR CREATORS
            </p>
            <h2 className="font-heading text-2xl xl:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Your Voice
              <br />
              <span className="text-[#ff4500]">Can Make a Difference.</span>
            </h2>
            <p className="text-xs text-[#a5a6af] font-sans leading-relaxed">
              Share your messages, stories, and teachings with a global audience. Inspire, equip, and build faith through podcasting.
            </p>
          </div>

          {/* 4 Creator Value Props */}
          <div className="space-y-4">
            {/* 1. Reach a Global Audience */}
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-full bg-[#ffb13b]/10 text-[#ffb13b] shrink-0 mt-0.5 border border-[#ffb13b]/30">
                <Mic className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-heading text-xs font-bold text-white">Reach a Global Audience</h4>
                <p className="text-[10px] text-[#a5a6af] leading-relaxed">
                  Share your content with listeners worldwide.
                </p>
              </div>
            </div>

            {/* 2. Grow Your Ministry */}
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-full bg-[#ffb13b]/10 text-[#ffb13b] shrink-0 mt-0.5 border border-[#ffb13b]/30">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-heading text-xs font-bold text-white">Grow Your Ministry</h4>
                <p className="text-[10px] text-[#a5a6af] leading-relaxed">
                  Build your audience and track your impact.
                </p>
              </div>
            </div>

            {/* 3. Be Part of a Community */}
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-full bg-[#ffb13b]/10 text-[#ffb13b] shrink-0 mt-0.5 border border-[#ffb13b]/30">
                <Users className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-heading text-xs font-bold text-white">Be Part of a Community</h4>
                <p className="text-[10px] text-[#a5a6af] leading-relaxed">
                  Connect with like-minded creators and believers.
                </p>
              </div>
            </div>

            {/* 4. Make an Eternal Impact */}
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-full bg-[#ffb13b]/10 text-[#ffb13b] shrink-0 mt-0.5 border border-[#ffb13b]/30">
                <Heart className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-heading text-xs font-bold text-white">Make an Eternal Impact</h4>
                <p className="text-[10px] text-[#a5a6af] leading-relaxed">
                  Help people grow in faith, purpose, and truth.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Scripture Quote in Cinzel */}
          <div className="pt-3 border-t border-[#201f24] space-y-1">
            <blockquote className="font-cinzel text-xs text-[#d0cfd6] italic leading-relaxed">
              &ldquo;Go into all the world and preach the gospel to all creation.&rdquo;
            </blockquote>
            <p className="font-mono text-[10px] text-[#ff4500] font-bold">
              MARK 16:15 (NIV)
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
