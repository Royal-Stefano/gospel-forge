"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileAudio,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Save,
  Radio,
  Clock,
  Sparkles,
  Info,
  ShieldAlert,
} from "lucide-react";
import { usePodcastStore } from "@/context/PodcastStoreContext";
import { useAuth } from "@/context/AuthContext";
import { Episode, PublicationStatus } from "@/types";
import { formatTime, cn } from "@/lib/utils";

export default function NewEpisodeWizardPage() {
  const router = useRouter();
  const { seriesList, speakers, createEpisode } = usePodcastStore();
  const { currentUser, canPublish } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Media Upload State
  const [audioFile, setAudioFile] = useState<{
    name: string;
    size: number;
    url: string;
    durationSeconds: number;
  } | null>(null);
  const [audioUploadProgress, setAudioUploadProgress] = useState<number>(0);
  const [isAudioUploading, setIsAudioUploading] = useState<boolean>(false);

  const [artworkUrl, setArtworkUrl] = useState<string>(
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80"
  );
  const [artworkUploadProgress, setArtworkUploadProgress] = useState<number>(0);

  // Step 2: Episode Details State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [episodeNumber, setEpisodeNumber] = useState<number>(1);
  const [seasonNumber, setSeasonNumber] = useState<number>(1);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(
    seriesList[0]?.id || "series-1"
  );
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>(
    speakers[0]?.id || "spk-1"
  );
  const [description, setDescription] = useState("");
  const [showNotes, setShowNotes] = useState("");
  const [scriptureReferences, setScriptureReferences] = useState(
    "Romans 8:28, Isaiah 48:10"
  );
  const [topics, setTopics] = useState("Faith, Disciple, Spiritual Warfare");
  const [transcript, setTranscript] = useState("");
  const [isExplicit, setIsExplicit] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  // Step 3: Audio Preview State
  const [isPreviewAudioPlaying, setIsPreviewAudioPlaying] = useState(false);
  const [previewAudioEl, setPreviewAudioEl] = useState<HTMLAudioElement | null>(null);

  // Step 4: Publication Options
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("12:00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [publicationSuccess, setPublicationSuccess] = useState<Episode | null>(null);

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generatedSlug);
  };

  // Direct Audio File Upload Handler (Simulates direct-to-object-storage signed upload)
  const handleAudioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("audio") && !file.name.endsWith(".mp3")) {
      alert("Invalid file format. Please upload an MP3 audio file.");
      return;
    }

    setIsAudioUploading(true);
    setAudioUploadProgress(10);

    const interval = setInterval(() => {
      setAudioUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAudioUploading(false);
          // Set real playable fallback or object URL
          setAudioFile({
            name: file.name,
            size: file.size,
            url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            durationSeconds: 2420,
          });
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  // Artwork file upload simulation
  const handleArtworkFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setArtworkUploadProgress(20);
    const interval = setInterval(() => {
      setArtworkUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setArtworkUrl(
            "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800&auto=format&fit=crop&q=80"
          );
          return 100;
        }
        return prev + 40;
      });
    }, 150);
  };

  // Preview Audio Toggle
  const togglePreviewAudio = () => {
    if (!previewAudioEl) {
      const audio = new Audio(
        audioFile?.url || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
      );
      audio.onended = () => setIsPreviewAudioPlaying(false);
      audio.play().then(() => setIsPreviewAudioPlaying(true));
      setPreviewAudioEl(audio);
    } else {
      if (isPreviewAudioPlaying) {
        previewAudioEl.pause();
        setIsPreviewAudioPlaying(false);
      } else {
        previewAudioEl.play();
        setIsPreviewAudioPlaying(true);
      }
    }
  };

  // Publish / Save Handler
  const handleFinalAction = async (status: PublicationStatus) => {
    setSubmissionError(null);
    setIsSubmitting(true);

    if (previewAudioEl) {
      previewAudioEl.pause();
    }

    const series = seriesList.find((s) => s.id === selectedSeriesId) || seriesList[0];
    const speaker = speakers.find((s) => s.id === selectedSpeakerId) || speakers[0];

    let scheduledPublishAt: string | undefined = undefined;
    if (status === "scheduled") {
      if (!scheduledDate) {
        setSubmissionError("Please select a publication date for scheduled release.");
        setIsSubmitting(false);
        return;
      }
      scheduledPublishAt = new Date(`${scheduledDate}T${scheduledTime}:00Z`).toISOString();
    }

    const episodePayload = {
      seriesId: series.id,
      seriesTitle: series.title,
      title: title.trim(),
      slug: slug.trim() || `episode-${Date.now()}`,
      description: description.trim(),
      showNotes: showNotes.trim(),
      transcript: transcript.trim(),
      audioUrl:
        audioFile?.url || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      artworkUrl: artworkUrl,
      durationSeconds: audioFile?.durationSeconds || 2420,
      publishedAt: new Date().toISOString(),
      scheduledPublishAt,
      status,
      episodeNumber: Number(episodeNumber),
      seasonNumber: Number(seasonNumber),
      speaker,
      topics: topics.split(",").map((t) => t.trim()).filter(Boolean),
      scriptureReferences: scriptureReferences
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      isExplicit,
      youtubeUrl: youtubeUrl.trim(),
      seoTitle: seoTitle.trim() || title,
      seoDescription: seoDescription.trim() || description,
    };

    const res = await createEpisode(episodePayload);
    setIsSubmitting(false);

    if (res.success && res.episode) {
      setPublicationSuccess(res.episode);
    } else {
      setSubmissionError(res.error || "Failed to create episode.");
    }
  };

  // If successfully published / saved
  if (publicationSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6 animate-in fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.4)]">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#ffb13b] font-bold">
            Workflow Complete
          </span>
          <h2 className="font-heading text-3xl font-extrabold text-white mt-1">
            {publicationSuccess.status === "published"
              ? "Episode Successfully Published!"
              : publicationSuccess.status === "scheduled"
              ? "Episode Scheduled for Release"
              : "Draft Saved to Studio"}
          </h2>
          <p className="text-sm text-[#a5a6af] mt-2 font-body max-w-md mx-auto">
            {publicationSuccess.status === "published"
              ? `"${publicationSuccess.title}" is now live on the public Gospel Forge streaming platform.`
              : `"${publicationSuccess.title}" has been saved to your studio database.`}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#121113] border border-[#222123] flex items-center gap-4 text-left max-w-md mx-auto">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[#2a2929]">
            <Image
              src={publicationSuccess.artworkUrl}
              alt={publicationSuccess.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-[#ffb13b] uppercase">
              {publicationSuccess.seriesTitle}
            </span>
            <h4 className="text-sm font-bold text-white truncate">
              {publicationSuccess.title}
            </h4>
            <p className="text-xs text-[#a5a6af]">
              Duration: {formatTime(publicationSuccess.durationSeconds)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          {publicationSuccess.status === "published" && (
            <Link
              href={`/episodes/${publicationSuccess.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#ff4500] to-[#ffb13b] text-black font-heading font-bold text-xs uppercase tracking-wider shadow-lg"
            >
              <Radio className="w-4 h-4" />
              <span>Listen on Public Website</span>
            </Link>
          )}

          <Link
            href="/studio/episodes"
            className="px-6 py-3 rounded-full bg-[#181719] hover:bg-[#201f22] border border-[#262527] text-xs font-semibold text-white transition-colors"
          >
            Studio Episode Manager
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Wizard Steps Header */}
      <div>
        <h1 className="font-heading text-3xl font-extrabold text-white tracking-wide">
          Episode Upload Wizard
        </h1>
        <p className="text-sm text-[#a5a6af] mt-1 font-body">
          Direct object-storage ingest, metadata authoring, preview, and publication.
        </p>

        {/* Step Progress Indicators */}
        <div className="grid grid-cols-4 gap-2 mt-6">
          {[
            { num: 1, label: "Media Upload" },
            { num: 2, label: "Metadata & Details" },
            { num: 3, label: "Staff Preview" },
            { num: 4, label: "Publish & Release" },
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => {
                if (s.num < step) setStep(s.num as any);
              }}
              className={cn(
                "p-3 rounded-xl border text-center transition-all cursor-pointer",
                step === s.num
                  ? "bg-[#1c1410] border-[#ff4500] shadow-[0_0_15px_rgba(255,69,0,0.3)]"
                  : step > s.num
                  ? "bg-[#121113] border-emerald-500/40 text-emerald-400"
                  : "bg-[#121113] border-[#222123] text-[#6e6f77]"
              )}
            >
              <span className="text-[10px] font-mono uppercase font-bold block">
                Step 0{s.num}
              </span>
              <span className="text-xs font-semibold text-white truncate block mt-0.5">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {submissionError && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{submissionError}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 1: MEDIA UPLOAD (AUDIO & ARTWORK) */}
      {/* ========================================================= */}
      {step === 1 && (
        <div className="p-6 md:p-8 rounded-3xl bg-[#111113] border border-[#222123] space-y-6 animate-in fade-in">
          <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#ff4500]" />
            Step 1: Direct-to-Storage Media Ingest
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Audio Upload Box */}
            <div className="p-6 rounded-2xl bg-[#161517] border border-[#262527] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#ffb13b] uppercase font-bold">
                  MP3 Audio Master
                </span>
                <span className="text-[10px] text-[#6e6f77] font-mono">
                  Up to 250MB
                </span>
              </div>

              {audioFile ? (
                <div className="p-4 rounded-xl bg-[#1c1b1b] border border-emerald-500/40 space-y-2">
                  <div className="flex items-center gap-3">
                    <FileAudio className="w-6 h-6 text-emerald-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">
                        {audioFile.name}
                      </p>
                      <p className="text-[10px] font-mono text-[#a5a6af]">
                        {(audioFile.size / (1024 * 1024)).toFixed(1)} MB • ~
                        {formatTime(audioFile.durationSeconds)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAudioFile(null)}
                    className="text-[11px] text-red-400 hover:underline"
                  >
                    Replace Audio
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-[#2e2d2f] hover:border-[#ff4500]/60 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors block">
                  <Upload className="w-8 h-8 text-[#ff4500] mb-2" />
                  <span className="text-xs font-bold text-white">
                    {isAudioUploading ? "Uploading to Storage..." : "Select MP3 Master File"}
                  </span>
                  <span className="text-[11px] text-[#6e6f77] mt-1">
                    Direct signed upload to object storage
                  </span>
                  <input
                    type="file"
                    accept="audio/mp3,audio/*"
                    onChange={handleAudioFileSelect}
                    className="hidden"
                  />
                  {isAudioUploading && (
                    <div className="w-full bg-[#222123] h-1.5 rounded-full mt-4 overflow-hidden">
                      <div
                        className="bg-[#ff4500] h-full transition-all"
                        style={{ width: `${audioUploadProgress}%` }}
                      />
                    </div>
                  )}
                </label>
              )}
            </div>

            {/* Artwork Upload Box */}
            <div className="p-6 rounded-2xl bg-[#161517] border border-[#262527] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#ffb13b] uppercase font-bold">
                  Cover Artwork
                </span>
                <span className="text-[10px] text-[#6e6f77] font-mono">
                  1400x1400px+ (JPG / PNG)
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-[#2a2929] shrink-0">
                  <Image
                    src={artworkUrl}
                    alt="Cover artwork preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="inline-block px-4 py-2 rounded-lg bg-[#201f22] hover:bg-[#28272b] border border-[#2e2d2f] text-xs font-mono text-white cursor-pointer transition-colors">
                    <span>Upload Custom Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleArtworkFileSelect}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-[#6e6f77]">
                    Optimized for retina displays and podcast directories.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#1f1e20]">
            <button
              onClick={() => {
                if (!audioFile) {
                  // Fallback for instant workflow testing if user didn't pick an MP3
                  setAudioFile({
                    name: "Forge_Episode_Master.mp3",
                    size: 42500000,
                    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                    durationSeconds: 2720,
                  });
                }
                setStep(2);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#ff4500] to-[#ffb13b] text-black font-heading font-bold text-xs uppercase tracking-wider"
            >
              <span>Continue to Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 2: METADATA & DETAILS */}
      {/* ========================================================= */}
      {step === 2 && (
        <div className="p-6 md:p-8 rounded-3xl bg-[#111113] border border-[#222123] space-y-6 animate-in fade-in">
          <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#ff4500]" />
            Step 2: Episode Metadata & Discipleship Context
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-mono text-[#a5a6af] uppercase tracking-wider">
                Episode Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Forged Through the Fire"
                className="w-full bg-[#161517] text-sm text-white placeholder-[#6e6f77] px-4 py-2.5 rounded-xl border border-[#262527] focus:border-[#ff4500] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-[#a5a6af] uppercase tracking-wider">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="forged-through-the-fire"
                className="w-full bg-[#161517] text-sm text-white placeholder-[#6e6f77] px-4 py-2.5 rounded-xl border border-[#262527] focus:border-[#ff4500] focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-[#a5a6af] uppercase tracking-wider">
                Series / Show *
              </label>
              <select
                value={selectedSeriesId}
                onChange={(e) => setSelectedSeriesId(e.target.value)}
                className="w-full bg-[#161517] text-sm text-white px-4 py-2.5 rounded-xl border border-[#262527] focus:border-[#ff4500] focus:outline-none"
              >
                {seriesList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-[#a5a6af] uppercase tracking-wider">
                Speaker / Teacher *
              </label>
              <select
                value={selectedSpeakerId}
                onChange={(e) => setSelectedSpeakerId(e.target.value)}
                className="w-full bg-[#161517] text-sm text-white px-4 py-2.5 rounded-xl border border-[#262527] focus:border-[#ff4500] focus:outline-none"
              >
                {speakers.map((spk) => (
                  <option key={spk.id} value={spk.id}>
                    {spk.name} ({spk.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#a5a6af] uppercase tracking-wider">
                  Episode #
                </label>
                <input
                  type="number"
                  value={episodeNumber}
                  onChange={(e) => setEpisodeNumber(Number(e.target.value))}
                  className="w-full bg-[#161517] text-sm text-white px-4 py-2.5 rounded-xl border border-[#262527] focus:border-[#ff4500] focus:outline-none font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#a5a6af] uppercase tracking-wider">
                  Season #
                </label>
                <input
                  type="number"
                  value={seasonNumber}
                  onChange={(e) => setSeasonNumber(Number(e.target.value))}
                  className="w-full bg-[#161517] text-sm text-white px-4 py-2.5 rounded-xl border border-[#262527] focus:border-[#ff4500] focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-mono text-[#a5a6af] uppercase tracking-wider">
                Short Description *
              </label>
              <textarea
                rows={2}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A compelling 2-sentence summary of the message..."
                className="w-full bg-[#161517] text-sm text-white placeholder-[#6e6f77] p-3 rounded-xl border border-[#262527] focus:border-[#ff4500] focus:outline-none resize-none"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-mono text-[#a5a6af] uppercase tracking-wider">
                Scripture Anchors (comma separated)
              </label>
              <input
                type="text"
                value={scriptureReferences}
                onChange={(e) => setScriptureReferences(e.target.value)}
                placeholder="Romans 8:28, Isaiah 48:10, James 1:2"
                className="w-full bg-[#161517] text-sm text-white placeholder-[#6e6f77] px-4 py-2.5 rounded-xl border border-[#262527] focus:border-[#ff4500] focus:outline-none"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-mono text-[#a5a6af] uppercase tracking-wider">
                Show Notes & Study Guide
              </label>
              <textarea
                rows={4}
                value={showNotes}
                onChange={(e) => setShowNotes(e.target.value)}
                placeholder="Outline, timestamps, key quotes..."
                className="w-full bg-[#161517] text-sm text-white placeholder-[#6e6f77] p-3 rounded-xl border border-[#262527] focus:border-[#ff4500] focus:outline-none font-mono text-xs"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-[#1f1e20]">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-full bg-[#181719] text-xs font-semibold text-white"
            >
              ← Back to Media
            </button>
            <button
              onClick={() => {
                if (!title.trim()) {
                  alert("Please enter an episode title.");
                  return;
                }
                setStep(3);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#ff4500] to-[#ffb13b] text-black font-heading font-bold text-xs uppercase tracking-wider"
            >
              <span>Continue to Preview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 3: STAFF AUDIO & PAGE PREVIEW */}
      {/* ========================================================= */}
      {step === 3 && (
        <div className="p-6 md:p-8 rounded-3xl bg-[#111113] border border-[#222123] space-y-6 animate-in fade-in">
          <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#ff4500]" />
            Step 3: Preview Exact Public Appearance
          </h2>

          {/* Realistic Episode Card Preview */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#161110] via-[#121113] to-[#0a0a0b] border border-[#ff4500]/30 flex flex-col md:flex-row items-center gap-6 shadow-xl">
            <div className="relative w-36 h-36 rounded-2xl overflow-hidden shrink-0 border border-[#2a2929]">
              <Image
                src={artworkUrl}
                alt={title || "Episode Artwork"}
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-2 flex-1 text-center md:text-left">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#ffb13b] font-bold">
                {seriesList.find((s) => s.id === selectedSeriesId)?.title} • Ep 0
                {episodeNumber}
              </span>
              <h3 className="font-heading text-2xl font-bold text-white">
                {title || "Untitled Episode Master"}
              </h3>
              <p className="text-xs text-[#a5a6af] line-clamp-2">
                {description || "No description provided."}
              </p>

              {/* Working Audio Preview Button */}
              <div className="pt-2 flex items-center justify-center md:justify-start gap-4">
                <button
                  type="button"
                  onClick={togglePreviewAudio}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#ff4500] to-[#ffb13b] text-black font-heading font-bold text-xs uppercase tracking-wider shadow-lg"
                >
                  {isPreviewAudioPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Pause Audio Preview</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                      <span>Test Audio Stream</span>
                    </>
                  )}
                </button>
                <span className="text-xs font-mono text-[#a5a6af]">
                  {formatTime(audioFile?.durationSeconds || 2720)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-[#1f1e20]">
            <button
              onClick={() => {
                if (previewAudioEl) previewAudioEl.pause();
                setStep(2);
              }}
              className="px-5 py-2.5 rounded-full bg-[#181719] text-xs font-semibold text-white"
            >
              ← Back to Details
            </button>
            <button
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#ff4500] to-[#ffb13b] text-black font-heading font-bold text-xs uppercase tracking-wider"
            >
              <span>Proceed to Publish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 4: PUBLISH / SCHEDULE / DRAFT */}
      {/* ========================================================= */}
      {step === 4 && (
        <div className="p-6 md:p-8 rounded-3xl bg-[#111113] border border-[#222123] space-y-6 animate-in fade-in">
          <div>
            <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-[#ff4500]" />
              Step 4: Publication Engine
            </h2>
            <p className="text-xs text-[#a5a6af] mt-1 font-body">
              Select release strategy. Published episodes immediately stream on the public website.
            </p>
          </div>

          {/* Action options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Option A: Publish Now (Requires Admin) */}
            <div
              className={cn(
                "p-5 rounded-2xl border flex flex-col justify-between space-y-4",
                canPublish
                  ? "bg-[#181412] border-[#ff4500]/50"
                  : "bg-[#141315] border-[#222123] opacity-60"
              )}
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff4500] font-bold">
                  Immediate Release
                </span>
                <h3 className="text-lg font-bold text-white mt-1">Publish Now</h3>
                <p className="text-xs text-[#a5a6af] mt-1 font-body">
                  Makes episode immediately accessible on the homepage, browse, and search feeds.
                </p>
              </div>

              {canPublish ? (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleFinalAction("published")}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ff4500] to-[#ffb13b] text-black font-heading font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(255,69,0,0.5)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Publishing..." : "Publish Episode Now"}
                </button>
              ) : (
                <div className="p-2.5 rounded-lg bg-[#1c1b1b] border border-red-500/30 text-red-300 text-[10px] font-mono flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>Admin role required to publish</span>
                </div>
              )}
            </div>

            {/* Option B: Schedule Release */}
            <div
              className={cn(
                "p-5 rounded-2xl border flex flex-col justify-between space-y-4",
                canPublish
                  ? "bg-[#121316] border-blue-500/40"
                  : "bg-[#141315] border-[#222123] opacity-60"
              )}
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold">
                  Automated Release
                </span>
                <h3 className="text-lg font-bold text-white mt-1">Schedule Publication</h3>
                <div className="mt-2 space-y-2 text-xs">
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-[#181719] text-white p-2 rounded-lg border border-[#2a2929] text-xs font-mono"
                  />
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-[#181719] text-white p-2 rounded-lg border border-[#2a2929] text-xs font-mono"
                  />
                </div>
              </div>

              {canPublish ? (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleFinalAction("scheduled")}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-heading font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  Schedule Release
                </button>
              ) : (
                <div className="p-2 rounded bg-[#1c1b1b] text-red-300 text-[10px] font-mono">
                  Admin role required
                </div>
              )}
            </div>

            {/* Option C: Save Draft (Accessible to Editors) */}
            <div className="p-5 rounded-2xl bg-[#141315] border border-[#262527] flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#ffb13b] font-bold">
                  Work in Progress
                </span>
                <h3 className="text-lg font-bold text-white mt-1">Save Draft</h3>
                <p className="text-xs text-[#a5a6af] mt-1 font-body">
                  Save progress securely to studio. Remains hidden from public listeners.
                </p>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleFinalAction("draft")}
                className="w-full py-2.5 rounded-xl bg-[#201f22] hover:bg-[#28272b] border border-[#2e2d2f] text-white font-heading font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                Save as Draft
              </button>
            </div>
          </div>

          <div className="flex justify-start pt-4 border-t border-[#1f1e20]">
            <button
              onClick={() => setStep(3)}
              className="px-5 py-2.5 rounded-full bg-[#181719] text-xs font-semibold text-white"
            >
              ← Back to Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
