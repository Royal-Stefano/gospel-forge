"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileAudio,
  ImageIcon,
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
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Trash2,
  Plus,
  BookOpen,
  Hash,
  Layers,
  ChevronDown,
  X,
  Volume2,
  FileText,
  Share2,
  Flame,
  Check,
} from "lucide-react";
import { usePodcastStore } from "@/context/PodcastStoreContext";
import { useAuth } from "@/context/AuthContext";
import type { Episode, PublicationStatus } from "@/types";
import { formatTime, cn } from "@/lib/utils";
import { VolcanicSummitCathedral } from "@/components/brand/VolcanicSummitCathedral";

export default function NewEpisodeWizardPage() {
  const router = useRouter();
  const { seriesList, speakers, createEpisode } = usePodcastStore();
  const { currentUser, canPublish } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [title, setTitle] = useState("Purpose in the Process");
  const [slug, setSlug] = useState("purpose-in-the-process");
  const [episodeNumber, setEpisodeNumber] = useState<number>(1);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(
    seriesList[0]?.id || "series-1"
  );
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>(
    speakers[0]?.id || "spk-1"
  );
  const [description, setDescription] = useState(
    "A powerful conversation about finding God's purpose in every season of life, especially in the waiting..."
  );

  // Tags & Scripture State
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(["Faith", "Purpose", "Growth"]);
  const [scriptureInput, setScriptureInput] = useState("");
  const [scriptures, setScriptures] = useState<string[]>([
    "Romans 8:28",
    "Isaiah 48:10",
  ]);

  // Audio Upload State
  const [audioUrl, setAudioUrl] = useState<string>(
    "https://storage.googleapis.com/gospel-forge-audio/sample-forge-episode.mp3"
  );
  const [audioFile, setAudioFile] = useState<{
    name: string;
    size: string;
    duration: string;
    durationSeconds: number;
  } | null>({
    name: "purpose_in_the_process_final_master.mp3",
    size: "42.8 MB",
    duration: "45:20",
    durationSeconds: 2720,
  });
  const [isAudioUploading, setIsAudioUploading] = useState(false);
  const [isArtworkUploading, setIsArtworkUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Artwork & Media State
  const [artworkUrl, setArtworkUrl] = useState<string>(
    "https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000&auto=format&fit=crop&q=80"
  );
  const [bannerUrl, setBannerUrl] = useState<string>(
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80"
  );
  const [audioThumbnailUrl, setAudioThumbnailUrl] = useState<string>(
    "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&auto=format&fit=crop&q=80"
  );
  const artworkInputRef = useRef<HTMLInputElement>(null);

  // Gallery Images
  const [galleryImages, setGalleryImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80",
  ]);

  // Publishing Options State
  const [publishOption, setPublishOption] = useState<"now" | "schedule">("now");
  const [scheduledDate, setScheduledDate] = useState("2026-10-30");
  const [scheduledTime, setScheduledTime] = useState("09:00");

  // Advanced Settings State
  const [isExplicit, setIsExplicit] = useState(false);
  const [transcript, setTranscript] = useState(
    "Welcome to The Forge Podcast. Today we are diving into Romans 8:28..."
  );
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isPatronOnly, setIsPatronOnly] = useState(false);
  const [normalizeLoudness, setNormalizeLoudness] = useState(true);

  // Preview Playback State
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(28);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const currentSeries =
    seriesList.find((s) => s.id === selectedSeriesId) || seriesList[0];

  // Tag Handlers
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim()) && tags.length < 10) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Scripture Handlers
  const handleAddScripture = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && scriptureInput.trim()) {
      e.preventDefault();
      if (!scriptures.includes(scriptureInput.trim()) && scriptures.length < 5) {
        setScriptures([...scriptures, scriptureInput.trim()]);
      }
      setScriptureInput("");
    }
  };

  const handleRemoveScripture = (scriptureToRemove: string) => {
    setScriptures(scriptures.filter((s) => s !== scriptureToRemove));
  };

  // Audio Upload via Presigned R2 API with graceful fallback
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsAudioUploading(true);

    let durationSeconds = 2720;
    try {
      const audioObj = new Audio(URL.createObjectURL(file));
      await new Promise<void>((resolve) => {
        audioObj.onloadedmetadata = () => {
          if (!isNaN(audioObj.duration) && isFinite(audioObj.duration)) {
            durationSeconds = Math.round(audioObj.duration);
          }
          resolve();
        };
        audioObj.onerror = () => resolve();
      });
    } catch {
      // Keep default estimated duration if extraction fails
    }

    const durationMinutes = Math.floor(durationSeconds / 60);
    const durationRemSec = durationSeconds % 60;
    const durationFormatted = `${durationMinutes}:${durationRemSec < 10 ? "0" : ""}${durationRemSec}`;

    setAudioFile({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      duration: durationFormatted,
      durationSeconds,
    });

    try {
      const res = await fetch("/api/media/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileSizeBytes: file.size,
          contentType: file.type || "audio/mpeg",
          mediaType: "audio",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.uploadUrl) {
          const uploadRes = await fetch(data.uploadUrl, {
            method: "PUT",
            headers: data.headers || { "Content-Type": file.type || "audio/mpeg" },
            body: file,
          });

          if (uploadRes.ok) {
            setAudioUrl(data.publicDeliveryUrl || URL.createObjectURL(file));
          } else {
            console.warn("Direct R2 upload response not OK, using media delivery endpoint.");
            setAudioUrl(data.publicDeliveryUrl || URL.createObjectURL(file));
          }
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        if (errData.error) {
          console.warn("Upload URL error:", errData.error);
        }
        setAudioUrl(URL.createObjectURL(file));
      }
    } catch (err) {
      console.warn("Audio upload network notice, using local media buffer:", err);
      setAudioUrl(URL.createObjectURL(file));
    } finally {
      setIsAudioUploading(false);
    }
  };

  // Artwork Upload via Presigned R2 API with graceful preview
  const handleArtworkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsArtworkUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setArtworkUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    try {
      const res = await fetch("/api/media/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileSizeBytes: file.size,
          contentType: file.type || "image/jpeg",
          mediaType: "artwork",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.uploadUrl) {
          await fetch(data.uploadUrl, {
            method: "PUT",
            headers: data.headers || { "Content-Type": file.type || "image/jpeg" },
            body: file,
          });
          if (data.publicDeliveryUrl) {
            setArtworkUrl(data.publicDeliveryUrl);
          }
        }
      }
    } catch (err) {
      console.warn("Artwork upload notice, keeping local preview:", err);
    } finally {
      setIsArtworkUploading(false);
    }
  };

  // Gallery Image Add
  const handleAddGalleryImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && galleryImages.length < 5) {
        setGalleryImages([...galleryImages, event.target.result as string]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setGalleryImages(galleryImages.filter((_, idx) => idx !== indexToRemove));
  };

  // Final Publish Handler
  const handlePublish = async (asDraft: boolean = false) => {
    setIsSubmitting(true);
    try {
      let finalStatus: PublicationStatus = "draft";
      if (!asDraft) {
        if (canPublish) {
          finalStatus = publishOption === "now" ? "published" : "scheduled";
        } else {
          finalStatus = "submitted";
        }
      }

      const newEpisodeData: Partial<Episode> = {
        title: title || "Untitled Episode",
        slug: slug || `episode-${Date.now()}`,
        description: description,
        showNotes: description,
        seriesId: selectedSeriesId,
        speakerId: selectedSpeakerId,
        episodeNumber: Number(episodeNumber) || 1,
        seasonNumber: 1,
        durationSeconds: audioFile?.durationSeconds || 2720,
        audioUrl: audioUrl,
        artworkUrl: artworkUrl,
        bannerUrl: bannerUrl,
        scriptureReferences: scriptures,
        topics: tags,
        status: finalStatus,
        publishDate:
          finalStatus === "published"
            ? new Date().toISOString()
            : finalStatus === "scheduled"
            ? new Date(`${scheduledDate}T${scheduledTime}:00Z`).toISOString()
            : new Date().toISOString(),
        isExplicit: isExplicit,
        transcript: transcript,
      };

      await createEpisode(newEpisodeData as any);
      setIsSuccess(true);
    } catch (err) {
      console.error("Failed to publish episode:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen text-[#f5f0ea] p-4 sm:p-6 lg:p-8">
      {/* Top Background Sunset Glow and Summit Cross */}
      <VolcanicSummitCathedral intensity="subtle" />

      <div className="relative max-w-7xl mx-auto space-y-6">
        {/* ================= HEADER SECTION ================= */}
        <div>
          <span className="text-[11px] font-mono tracking-widest text-[#ff7733] uppercase font-bold flex items-center gap-1.5 mb-1.5">
            <Flame className="w-3.5 h-3.5 text-[#ff4500]" />
            UPLOAD EPISODE
          </span>

          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            {step === 1 && (
              <>
                Share a{" "}
                <span className="bg-gradient-to-r from-[#ff4500] via-[#ff7733] to-[#e63900] bg-clip-text text-transparent">
                  New Episode
                </span>
              </>
            )}
            {step === 2 && (
              <>
                Media &{" "}
                <span className="bg-gradient-to-r from-[#ff4500] via-[#ff7733] to-[#e63900] bg-clip-text text-transparent">
                  Artwork
                </span>
              </>
            )}
            {step === 3 && (
              <>
                Advanced{" "}
                <span className="bg-gradient-to-r from-[#ff4500] via-[#ff7733] to-[#e63900] bg-clip-text text-transparent">
                  Settings
                </span>
              </>
            )}
            {step === 4 && (
              <>
                Review &{" "}
                <span className="bg-gradient-to-r from-[#ff4500] via-[#ff7733] to-[#e63900] bg-clip-text text-transparent">
                  Publish
                </span>
              </>
            )}
          </h1>

          <p className="text-xs sm:text-sm text-[#a5a6af] mt-1 font-sans">
            {step === 1 &&
              "Add your audio, details, and publish to inspire listeners worldwide."}
            {step === 2 &&
              "Add engaging visuals and media to make your episode stand out."}
            {step === 3 &&
              "Configure distribution, metadata, and visibility preferences."}
            {step === 4 &&
              "Review all episode details before publishing to Gospel Forge."}
          </p>
        </div>

        {/* ================= 4-STEP WIZARD STEPPER ================= */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-4xl pt-1 pb-3">
          {[
            { id: 1, label: "Episode Details" },
            { id: 2, label: "Media & Artwork" },
            { id: 3, label: "Advanced Settings" },
            { id: 4, label: "Review & Publish" },
          ].map((item) => {
            const isCompleted = step > item.id;
            const isActive = step === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setStep(item.id as 1 | 2 | 3 | 4)}
                className="group flex flex-col items-start gap-1.5 text-left focus:outline-none"
              >
                <div className="flex items-center gap-2 w-full">
                  <div
                    className={cn(
                      "w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                      isActive
                        ? "bg-gradient-to-r from-[#ff4500] to-[#e63900] text-white shadow-[0_0_12px_rgba(255,69,0,0.5)] border border-[#ff6633]"
                        : isCompleted
                        ? "bg-[#e63900] text-white"
                        : "bg-[#18171b] text-[#6e6f77] border border-[#2a282f] group-hover:border-[#444]"
                    )}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : item.id}
                  </div>
                  <div
                    className={cn(
                      "hidden sm:block flex-1 h-[2px] transition-all",
                      isCompleted ? "bg-[#e63900]" : "bg-[#1f1d24]"
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-[11px] sm:text-xs font-medium tracking-wide transition-colors",
                    isActive
                      ? "text-white font-bold"
                      : isCompleted
                      ? "text-[#d1cfc7]"
                      : "text-[#6e6f77] group-hover:text-[#a5a6af]"
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* ================= STEP 1: EPISODE DETAILS ================= */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form Fields (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Episode Title */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <label htmlFor="title" className="text-white">
                    Episode Title <span className="text-[#ff4500]">*</span>
                  </label>
                  <span className="text-[#6e6f77] font-mono text-[11px]">
                    {title.length}/100
                  </span>
                </div>
                <input
                  id="title"
                  type="text"
                  maxLength={100}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-+|-+$/g, "")
                    );
                  }}
                  placeholder="Enter an engaging title for your episode..."
                  className="w-full px-4 py-3 rounded-xl bg-[#121114] border border-[#26242c] text-white placeholder-[#55535c] text-sm focus:outline-none focus:border-[#ff4500] focus:ring-1 focus:ring-[#ff4500] transition-all"
                />
              </div>

              {/* Episode Description with Rich Editor Toolbar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <label htmlFor="desc" className="text-white">
                    Episode Description <span className="text-[#ff4500]">*</span>
                  </label>
                  <span className="text-[#6e6f77] font-mono text-[11px]">
                    {description.length}/2000
                  </span>
                </div>

                <div className="rounded-xl border border-[#26242c] bg-[#121114] overflow-hidden focus-within:border-[#ff4500] focus-within:ring-1 focus-within:ring-[#ff4500] transition-all">
                  {/* Formatting Toolbar */}
                  <div className="flex items-center gap-1 px-3 py-2 border-b border-[#222026] bg-[#161519] text-[#a5a6af] text-xs">
                    <button
                      type="button"
                      className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#222026] hover:text-white"
                    >
                      <span>Paragraph</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <div className="w-[1px] h-4 bg-[#2a2830] mx-1" />
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-[#222026] hover:text-white"
                      title="Bold"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-[#222026] hover:text-white"
                      title="Italic"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-[#222026] hover:text-white"
                      title="Underline"
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-[1px] h-4 bg-[#2a2830] mx-1" />
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-[#222026] hover:text-white"
                      title="Bullet List"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-[#222026] hover:text-white"
                      title="Numbered List"
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-[#222026] hover:text-white"
                      title="Insert Link"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <textarea
                    id="desc"
                    rows={5}
                    maxLength={2000}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write a compelling description for your episode. Include key topics, takeaways, and who it's for..."
                    className="w-full p-4 bg-transparent text-white placeholder-[#55535c] text-sm focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Two Column: Series Selection & Episode Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="series" className="text-xs font-semibold text-white">
                    Series <span className="text-[#ff4500]">*</span>
                  </label>
                  <div className="relative">
                    <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e6f77] pointer-events-none" />
                    <select
                      id="series"
                      value={selectedSeriesId}
                      onChange={(e) => setSelectedSeriesId(e.target.value)}
                      className="w-full pl-10 pr-9 py-3 rounded-xl bg-[#121114] border border-[#26242c] text-white text-sm focus:outline-none focus:border-[#ff4500] appearance-none cursor-pointer"
                    >
                      {seriesList.map((s) => (
                        <option key={s.id} value={s.id} className="bg-[#121114] text-white">
                          {s.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e6f77] pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="epNum" className="text-xs font-semibold text-white">
                    Episode Number
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e6f77] pointer-events-none" />
                    <input
                      id="epNum"
                      type="number"
                      min={1}
                      value={episodeNumber}
                      onChange={(e) => setEpisodeNumber(Number(e.target.value))}
                      placeholder="e.g., 1"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#121114] border border-[#26242c] text-white placeholder-[#55535c] text-sm focus:outline-none focus:border-[#ff4500]"
                    />
                  </div>
                </div>
              </div>

              {/* Topics & Tags */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <label htmlFor="tags" className="text-white">
                    Topics & Tags
                  </label>
                  <span className="text-[#6e6f77] font-mono text-[11px]">
                    {tags.length}/10
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#121114] border border-[#26242c] focus-within:border-[#ff4500] transition-all">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1f1d24] text-xs text-[#f5f0ea] border border-[#2f2d38]"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-[#888] hover:text-[#ff4500]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    id="tags"
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add tags to help listeners find your episode..."
                    className="w-full px-2 py-1 bg-transparent text-sm text-white placeholder-[#55535c] focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-[#6e6f77]">Press Enter to add a tag</p>
              </div>

              {/* Scripture References */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <label htmlFor="scripture" className="text-white">
                    Scripture References
                  </label>
                  <span className="text-[#6e6f77] font-mono text-[11px]">
                    {scriptures.length}/5
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#121114] border border-[#26242c] focus-within:border-[#ff4500] transition-all">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {scriptures.map((scrip) => (
                      <span
                        key={scrip}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#ffb13b]/10 text-xs font-scripture text-[#ffb13b] border border-[#ffb13b]/30"
                      >
                        <BookOpen className="w-3 h-3" />
                        {scrip}
                        <button
                          type="button"
                          onClick={() => handleRemoveScripture(scrip)}
                          className="text-[#ffb13b]/70 hover:text-[#ff4500]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="relative flex items-center">
                    <BookOpen className="w-4 h-4 text-[#6e6f77] mr-2 shrink-0" />
                    <input
                      id="scripture"
                      type="text"
                      value={scriptureInput}
                      onChange={(e) => setScriptureInput(e.target.value)}
                      onKeyDown={handleAddScripture}
                      placeholder="e.g., John 3:16, Romans 8:28"
                      className="w-full py-1 bg-transparent text-sm text-white placeholder-[#55535c] focus:outline-none"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-[#6e6f77]">
                  Add relevant Bible verses (optional)
                </p>
              </div>
            </div>

            {/* Right Column: Audio & Artwork Cards (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Upload Audio Card */}
              <div className="p-4 rounded-2xl bg-[#111013] border border-[#222026] space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
                  Upload Audio
                </h3>

                <input
                  type="file"
                  ref={audioInputRef}
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                />

                <div
                  onClick={() => audioInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
                    audioFile
                      ? "border-[#ff4500]/40 bg-[#ff4500]/5"
                      : "border-[#2a2832] hover:border-[#ff4500]/60 bg-[#141316]"
                  )}
                >
                  <div className="flex justify-center mb-2">
                    <div className="p-3 rounded-full bg-[#1b191f] text-[#ff7733]">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-white">
                    {audioFile
                      ? audioFile.name
                      : "Drag and drop your audio file here"}
                  </p>
                  <p className="text-[11px] text-[#888] mt-0.5">
                    or <span className="text-[#ff7733] underline">click to browse</span>
                  </p>
                  <div className="mt-3 pt-3 border-t border-[#222026] text-[10px] text-[#6e6f77] space-y-0.5">
                    <p>Supports MP3, WAV, M4A (Max 500MB)</p>
                    <p>Recommended: 44.1 kHz, 128 kbps or higher</p>
                  </div>
                </div>
              </div>

              {/* Episode Artwork Card */}
              <div className="p-4 rounded-2xl bg-[#111013] border border-[#222026] space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
                  Episode Artwork
                </h3>

                <input
                  type="file"
                  ref={artworkInputRef}
                  accept="image/*"
                  onChange={handleArtworkUpload}
                  className="hidden"
                />

                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#18171b] border border-[#2a2832] shrink-0">
                    <Image
                      src={artworkUrl}
                      alt="Episode Artwork"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => artworkInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1b191e] hover:bg-[#25232a] text-xs font-semibold text-white border border-[#2f2d38] transition-all"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#ff7733]" />
                      <span>Upload Artwork</span>
                    </button>
                    <p className="text-[10px] text-[#6e6f77]">
                      JPG, PNG or WebP (Max 5MB)
                    </p>
                    <p className="text-[10px] text-[#6e6f77]">
                      Recommended: 4000 × 3000 px (1:1)
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview Card */}
              <div className="p-4 rounded-2xl bg-[#111013] border border-[#222026] space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
                  Preview
                </h3>

                <div className="p-3 rounded-xl bg-[#151418] border border-[#222026] flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={artworkUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-[#ff7733] uppercase">
                      Episode Preview
                    </span>
                    <h4 className="text-xs font-bold text-white truncate">
                      {title || "Episode Title"}
                    </h4>
                    <p className="text-[11px] text-[#888] truncate">
                      {currentSeries?.title || "Series Name"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPreviewPlaying(!isPreviewPlaying)}
                    className="w-8 h-8 rounded-full bg-[#ffb13b] text-black flex items-center justify-center hover:scale-105 transition-transform shrink-0"
                  >
                    {isPreviewPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                </div>

                {/* Scrubber preview bar */}
                <div className="space-y-1">
                  <div className="w-full h-1 bg-[#222026] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#ff4500] to-[#ffb13b]"
                      style={{ width: `${isPreviewPlaying ? 45 : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#6e6f77] font-mono">
                    <span>{isPreviewPlaying ? "20:30" : "00:00"}</span>
                    <span>{audioFile?.duration || "45:20"}</span>
                  </div>
                </div>
              </div>

              {/* Publishing Options Card */}
              <div className="p-4 rounded-2xl bg-[#111013] border border-[#222026] space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
                  Publishing Options
                </h3>

                <div className="space-y-2">
                  <label
                    onClick={() => setPublishOption("now")}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                      publishOption === "now"
                        ? "border-[#ff4500] bg-[#ff4500]/5"
                        : "border-[#222026] bg-[#141316] hover:border-[#333]"
                    )}
                  >
                    <input
                      type="radio"
                      name="pub"
                      checked={publishOption === "now"}
                      onChange={() => setPublishOption("now")}
                      className="mt-0.5 accent-[#ff4500]"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">Publish Now</p>
                      <p className="text-[11px] text-[#888]">
                        Make this episode available to listeners immediately.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setPublishOption("schedule")}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                      publishOption === "schedule"
                        ? "border-[#ff4500] bg-[#ff4500]/5"
                        : "border-[#222026] bg-[#141316] hover:border-[#333]"
                    )}
                  >
                    <input
                      type="radio"
                      name="pub"
                      checked={publishOption === "schedule"}
                      onChange={() => setPublishOption("schedule")}
                      className="mt-0.5 accent-[#ff4500]"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">
                        Schedule for Later
                      </p>
                      <p className="text-[11px] text-[#888]">
                        Choose a date and time to publish this episode.
                      </p>
                    </div>
                  </label>

                  {publishOption === "schedule" && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-[#18171b] border border-[#2c2a33] text-xs text-white focus:outline-none focus:border-[#ff4500]"
                      />
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-[#18171b] border border-[#2c2a33] text-xs text-white focus:outline-none focus:border-[#ff4500]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Primary Next Action */}
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#ff4500] via-[#e63900] to-[#b32b00] text-white font-heading font-bold text-xs tracking-wider uppercase hover:shadow-[0_0_25px_rgba(255,69,0,0.6)] transition-all flex items-center justify-center gap-2"
              >
                <span>Continue to Media & Artwork</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: MEDIA & ARTWORK ================= */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Artwork & Gallery (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Main Episode Artwork Card */}
              <div className="p-5 rounded-2xl bg-[#111013] border border-[#222026] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
                    Episode Artwork <span className="text-[#ff4500]">*</span>
                  </h3>
                  <span className="text-[11px] text-[#6e6f77]">Required</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* Left: Artwork Preview */}
                  <div className="sm:col-span-5 relative aspect-square rounded-xl overflow-hidden bg-[#18171b] border border-[#2a2832]">
                    <Image
                      src={artworkUrl}
                      alt="Main Artwork"
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Right: Drag & Drop Box */}
                  <div
                    onClick={() => artworkInputRef.current?.click()}
                    className="sm:col-span-7 border-2 border-dashed border-[#2a2832] hover:border-[#ff4500]/60 rounded-xl p-6 text-center cursor-pointer bg-[#141316] transition-all flex flex-col items-center justify-center min-h-[180px]"
                  >
                    <div className="p-3 rounded-full bg-[#1b191f] text-[#ff7733] mb-2">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-semibold text-white">
                      Drag and drop your artwork here
                    </p>
                    <p className="text-[11px] text-[#888] mt-0.5">
                      or <span className="text-[#ff7733] underline">click to browse</span>
                    </p>
                    <div className="mt-2 text-[10px] text-[#6e6f77] space-y-0.5">
                      <p>JPG, PNG or WebP (Max 5MB)</p>
                      <p>Recommended: 3000 × 3000 px (1:1)</p>
                    </div>
                  </div>
                </div>

                {/* Action buttons below artwork */}
                <div className="flex items-center gap-3 pt-2 border-t border-[#222026]">
                  <button
                    type="button"
                    onClick={() => artworkInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1b191e] hover:bg-[#25232a] text-xs font-semibold text-white border border-[#2f2d38] transition-all"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#ff7733]" />
                    <span>Replace Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setArtworkUrl("https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000&auto=format&fit=crop&q=80")}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1b191e] hover:bg-[#2a1717] text-xs font-semibold text-[#888] hover:text-[#ff4500] border border-[#2f2d38] transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>

              {/* Gallery Images Card */}
              <div className="p-5 rounded-2xl bg-[#111013] border border-[#222026] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
                    Gallery Images (Optional)
                  </h3>
                  <span className="text-[11px] text-[#6e6f77]">
                    {galleryImages.length}/5
                  </span>
                </div>

                {/* 5 Thumbnails Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-[#18171b] border border-[#2a2832]"
                    >
                      <Image
                        src={img}
                        alt={`Gallery ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#ff4500]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {galleryImages.length < 5 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-[#2a2832] hover:border-[#ff4500]/60 bg-[#141316] hover:bg-[#18161b] flex flex-col items-center justify-center cursor-pointer transition-all text-[#6e6f77] hover:text-white">
                      <Plus className="w-5 h-5 mb-1" />
                      <span className="text-[11px] font-semibold">Add Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAddGalleryImage}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <p className="text-[11px] text-[#6e6f77]">
                  Add up to 5 images (JPG, PNG or WebP - Max 5MB each)
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-xl bg-[#141317] hover:bg-[#1a1820] text-xs font-bold text-white border border-[#282630] transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Episode Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff4500] via-[#e63900] to-[#b32b00] text-white font-heading font-bold text-xs tracking-wider uppercase hover:shadow-[0_0_20px_rgba(255,69,0,0.5)] transition-all flex items-center gap-2"
                >
                  <span>Continue to Advanced Settings</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Column: Additional Media & Guidelines (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Additional Media (Optional) */}
              <div className="p-4 rounded-2xl bg-[#111013] border border-[#222026] space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
                  Additional Media (Optional)
                </h3>

                <div className="space-y-2.5">
                  {/* Episode Banner */}
                  <div className="p-3 rounded-xl bg-[#151418] border border-[#26242c] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-[#1d1b22] text-[#ff7733]">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Episode Banner</p>
                        <p className="text-[10px] text-[#6e6f77]">
                          3000 × 1024 px (Max 5MB)
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-[#1f1e24] hover:bg-[#282630] text-[11px] font-semibold text-white border border-[#312f3b] transition-all"
                    >
                      Upload Banner
                    </button>
                  </div>

                  {/* Audio Thumbnail */}
                  <div className="p-3 rounded-xl bg-[#151418] border border-[#26242c] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-[#1d1b22] text-[#ff7733]">
                        <Volume2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Audio Thumbnail</p>
                        <p className="text-[10px] text-[#6e6f77]">
                          1600 × 1600 px (Max 2MB)
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-[#1f1e24] hover:bg-[#282630] text-[11px] font-semibold text-white border border-[#312f3b] transition-all"
                    >
                      Upload Audio Thumbnail
                    </button>
                  </div>
                </div>
              </div>

              {/* Episode Preview Card */}
              <div className="p-4 rounded-2xl bg-[#111013] border border-[#222026] space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
                  Episode Preview
                </h3>

                <div className="space-y-3">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-[#18171b]">
                    <Image
                      src={artworkUrl}
                      alt="Artwork Preview"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <h4 className="font-heading text-sm font-bold text-white">
                      {title || "Purpose in the Process"}
                    </h4>
                    <p className="text-xs text-[#a5a6af] mt-0.5">
                      {currentSeries?.title || "The Forge Podcast"}
                    </p>
                    <p className="text-[10px] font-mono text-[#6e6f77] mt-0.5">
                      Episode 0{episodeNumber} • {audioFile?.duration || "45:20"}
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded bg-[#1e1c22] text-[10px] font-medium text-[#d1cfc7] border border-[#2e2c36]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="text-[11px] text-[#888] line-clamp-2 leading-relaxed">
                    {description ||
                      "A powerful conversation about finding God's purpose in every season of life..."}
                  </p>

                  {/* Mini Player */}
                  <div className="flex items-center gap-3 pt-2 border-t border-[#222026]">
                    <button
                      type="button"
                      onClick={() => setIsPreviewPlaying(!isPreviewPlaying)}
                      className="w-7 h-7 rounded-full bg-[#ffb13b] text-black flex items-center justify-center hover:scale-105 transition-transform shrink-0"
                    >
                      {isPreviewPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>
                    <div className="flex-1 h-1 bg-[#222026] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#ffb13b]"
                        style={{ width: `${isPreviewPlaying ? 40 : 0}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-[#6e6f77]">
                      00:00 / {audioFile?.duration || "45:20"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Media Guidelines Card */}
              <div className="p-4 rounded-2xl bg-[#111013] border border-[#222026] space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
                  Media Guidelines
                </h3>

                <ul className="text-[11px] text-[#a5a6af] space-y-2 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#ff7733] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Artwork:</strong> 3000 × 3000 px
                      (1:1), JPG/PNG/WebP, Max 5MB
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#ff7733] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Banner:</strong> 3000 × 1024 px,
                      JPG/PNG/WebP, Max 5MB
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#ff7733] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Audio Thumbnail:</strong> 1600 ×
                      1600 px, JPG/PNG/WebP, Max 2MB
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#ff7733] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Gallery Images:</strong> Up to 5
                      images, Max 5MB each
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#ff7733] shrink-0 mt-0.5" />
                    <span>
                      Use high-quality, relevant images that represent your content
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#ff7733] shrink-0 mt-0.5" />
                    <span>Avoid text overcrowding and ensure good contrast</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: ADVANCED SETTINGS ================= */}
        {step === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-5">
              {/* Audio Processing & Normalization */}
              <div className="p-5 rounded-2xl bg-[#111013] border border-[#222026] space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#ff7733]" />
                  Broadcast Audio Processing
                </h3>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#151418] border border-[#26242c] cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-white">
                        Loudness Normalization (-16 LUFS)
                      </p>
                      <p className="text-[11px] text-[#888]">
                        Automatically balance loudness across mobile speakers, car audio,
                        and headphones.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={normalizeLoudness}
                      onChange={(e) => setNormalizeLoudness(e.target.checked)}
                      className="w-4 h-4 accent-[#ff4500] rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#151418] border border-[#26242c] cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-white">
                        Explicit Content Filter Flag
                      </p>
                      <p className="text-[11px] text-[#888]">
                        Contains mature language or themes unsuitable for family listening.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isExplicit}
                      onChange={(e) => setIsExplicit(e.target.checked)}
                      className="w-4 h-4 accent-[#ff4500] rounded"
                    />
                  </label>
                </div>
              </div>

              {/* Full Transcript */}
              <div className="p-5 rounded-2xl bg-[#111013] border border-[#222026] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#ff7733]" />
                    Episode Transcript & Accessibility
                  </h3>
                  <span className="text-[11px] text-[#6e6f77]">Optional</span>
                </div>

                <p className="text-xs text-[#888]">
                  Providing a full transcript unlocks in-audio word search, scripture
                  timestamp links, and improves discoverability across search engines.
                </p>

                <textarea
                  rows={6}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste or type full transcript here..."
                  className="w-full p-4 rounded-xl bg-[#151418] border border-[#26242c] text-xs text-white placeholder-[#55535c] focus:outline-none focus:border-[#ff4500] font-sans leading-relaxed"
                />
              </div>

              {/* YouTube Video Sync */}
              <div className="p-5 rounded-2xl bg-[#111013] border border-[#222026] space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[#ff7733]" />
                  Video Podcast Sync (YouTube)
                </h3>
                <p className="text-xs text-[#888]">
                  Link an accompanying YouTube sermon or video broadcast. Gospel Forge
                  will provide seamless audio/video switching for listeners.
                </p>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 rounded-xl bg-[#151418] border border-[#26242c] text-sm text-white placeholder-[#55535c] focus:outline-none focus:border-[#ff4500]"
                />
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-3 rounded-xl bg-[#141317] hover:bg-[#1a1820] text-xs font-bold text-white border border-[#282630] transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Media & Artwork</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff4500] via-[#e63900] to-[#b32b00] text-white font-heading font-bold text-xs tracking-wider uppercase hover:shadow-[0_0_20px_rgba(255,69,0,0.5)] transition-all flex items-center gap-2"
                >
                  <span>Continue to Review & Publish</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Column: Settings Summary */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-5 rounded-2xl bg-[#111013] border border-[#222026] space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
                  Distribution Settings
                </h3>

                <ul className="text-xs text-[#a5a6af] space-y-2">
                  <li className="flex items-center justify-between py-1.5 border-b border-[#222026]">
                    <span>RSS Public Feed:</span>
                    <span className="text-emerald-400 font-semibold">Enabled</span>
                  </li>
                  <li className="flex items-center justify-between py-1.5 border-b border-[#222026]">
                    <span>Apple Podcasts:</span>
                    <span className="text-emerald-400 font-semibold">Ready</span>
                  </li>
                  <li className="flex items-center justify-between py-1.5 border-b border-[#222026]">
                    <span>Spotify For Podcasters:</span>
                    <span className="text-emerald-400 font-semibold">Ready</span>
                  </li>
                  <li className="flex items-center justify-between py-1.5">
                    <span>Gospel Forge HUD:</span>
                    <span className="text-[#ffb13b] font-semibold">Instant</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4: REVIEW & PUBLISH ================= */}
        {step === 4 && (
          <div className="max-w-4xl mx-auto space-y-6">
            {isSuccess ? (
              <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-[#18151c] to-[#0f0e12] border border-[#ff4500]/40 text-center space-y-5 shadow-[0_0_50px_rgba(255,69,0,0.2)]">
                <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-[#ff4500] to-[#e63900] text-white shadow-[0_0_30px_rgba(255,69,0,0.6)]">
                  <CheckCircle className="w-10 h-10" />
                </div>

                <div className="space-y-1">
                  <h2 className="font-heading text-2xl sm:text-3xl font-black text-white">
                    {canPublish
                      ? "Episode Successfully Processed!"
                      : "Episode Submitted for Review!"}
                  </h2>
                  <p className="text-sm text-[#a5a6af] max-w-lg mx-auto">
                    {canPublish
                      ? `"${title}" has been saved and configured on Gospel Forge.`
                      : `"${title}" has been submitted to the Gospel Forge editorial team. You will be notified once theological review is approved.`}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                  <Link
                    href={`/episodes/${slug}`}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff4500] to-[#e63900] text-white font-heading font-bold text-xs tracking-wider uppercase hover:shadow-[0_0_20px_rgba(255,69,0,0.5)] transition-all"
                  >
                    View Public Episode
                  </Link>

                  <Link
                    href="/studio/episodes"
                    className="px-6 py-3 rounded-xl bg-[#1b191f] hover:bg-[#25232a] text-xs font-bold text-white border border-[#2f2d38] transition-all"
                  >
                    Return to Episodes
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Summary Card */}
                <div className="p-6 rounded-2xl bg-[#111013] border border-[#222026] space-y-5">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-heading">
                    Episode Publication Summary
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                    <div className="sm:col-span-4 relative aspect-square rounded-xl overflow-hidden bg-[#18171b] border border-[#2a2832]">
                      <Image
                        src={artworkUrl}
                        alt="Final Artwork"
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="sm:col-span-8 space-y-3">
                      <div>
                        <span className="text-[11px] font-mono text-[#ff7733] uppercase">
                          Episode 0{episodeNumber} • {currentSeries?.title}
                        </span>
                        <h2 className="font-heading text-xl sm:text-2xl font-black text-white">
                          {title}
                        </h2>
                      </div>

                      <p className="text-xs text-[#a5a6af] line-clamp-3 leading-relaxed">
                        {description}
                      </p>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {tags.map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-1 rounded bg-[#1e1c22] text-xs text-[#d1cfc7] border border-[#2e2c36]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {scriptures.map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#ffb13b]/10 text-xs font-scripture text-[#ffb13b] border border-[#ffb13b]/30"
                          >
                            <BookOpen className="w-3 h-3" />
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms and Confirmation */}
                <div className="p-4 rounded-xl bg-[#141316] border border-[#222026] text-xs text-[#a5a6af] space-y-2">
                  <p>
                    By clicking <strong>{canPublish ? "Publish Episode Now" : "Submit for Editorial Review"}</strong>, you confirm that
                    this content complies with Gospel Forge doctrinal integrity
                    guidelines, and that you hold full broadcasting rights to all
                    underlying spoken word and musical elements.
                  </p>
                  {!canPublish && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#ff7733]/10 border border-[#ff7733]/20 text-[#ffb13b]">
                      <Info className="w-4 h-4 shrink-0 text-[#ff7733]" />
                      <span>
                        As a creator, your episode will be submitted to the Gospel Forge editorial team for theological review prior to public release.
                      </span>
                    </div>
                  )}
                </div>

                {/* Final Submit Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-5 py-3 rounded-xl bg-[#141317] hover:bg-[#1a1820] text-xs font-bold text-white border border-[#282630] transition-all flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Advanced Settings</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handlePublish(true)}
                      disabled={isSubmitting}
                      className="px-5 py-3.5 rounded-xl bg-[#18171d] hover:bg-[#201e26] text-white font-heading font-bold text-xs tracking-wider uppercase border border-[#2d2a36] transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 text-[#a5a6af]" />
                      <span>Save as Draft</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePublish(false)}
                      disabled={isSubmitting}
                      className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#ff4500] via-[#e63900] to-[#b32b00] text-white font-heading font-black text-xs tracking-wider uppercase hover:shadow-[0_0_30px_rgba(255,69,0,0.6)] transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Processing with The Forge...</span>
                      ) : canPublish ? (
                        <>
                          <Flame className="w-4 h-4" />
                          <span>Publish Episode Now</span>
                        </>
                      ) : (
                        <>
                          <Flame className="w-4 h-4" />
                          <span>Submit for Review</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
