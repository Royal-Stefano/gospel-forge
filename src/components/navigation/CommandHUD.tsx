"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  Radio,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Compass,
  BookOpen,
  Layers,
  Flame,
  X,
  Sliders,
  Sparkles,
  Command,
} from "lucide-react";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { usePodcastStore } from "@/context/PodcastStoreContext";
import { useAuth } from "@/context/AuthContext";
import { AudioVisualizer } from "@/components/audio/AudioVisualizer";
import { formatTime } from "@/lib/utils";

interface CommandHUDProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandHUD({ isOpen, onClose }: CommandHUDProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const {
    currentEpisode,
    isPlaying,
    togglePlay,
    skipBackward,
    skipForward,
    toggleMute,
    isMuted,
    playbackRate,
    setPlaybackRate,
    playEpisode,
  } = useAudioPlayer();

  const { getPublishedEpisodes, seriesList } = usePodcastStore();
  const { canAccessStudio } = useAuth();

  const [query, setQuery] = useState("");
  const [activeFrequency, setActiveFrequency] = useState("432 Hz Peace");
  const publishedEpisodes = getPublishedEpisodes();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredEpisodes = query.trim()
    ? publishedEpisodes.filter(
        (ep) =>
          ep.title.toLowerCase().includes(query.toLowerCase()) ||
          ep.speaker.name.toLowerCase().includes(query.toLowerCase()) ||
          ep.seriesTitle.toLowerCase().includes(query.toLowerCase()) ||
          ep.scriptureReferences?.some((ref) =>
            ref.toLowerCase().includes(query.toLowerCase())
          )
      )
    : [];

  const handleSelectEpisode = (ep: any) => {
    playEpisode(ep);
    onClose();
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Background click dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main HUD Window */}
      <div className="relative w-full max-w-2xl bg-[#0e0d0f] border border-[#ff4500]/40 rounded-2xl shadow-[0_0_60px_rgba(255,69,0,0.25)] overflow-hidden z-10 flex flex-col">
        {/* Top Telemetry Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#141316] border-b border-[#252428] text-[11px] font-mono text-[#a5a6af]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-white font-bold tracking-wider">
              FORGED FREQUENCY HUD
            </span>
            <span className="text-[#ff4500]">•</span>
            <span className="text-[#ffb13b]">SIGNAL LOCKED</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[#6e6f77]">
              48kHz // 24-BIT FLAC
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-[#201f24] text-[#a5a6af] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar Input */}
        <div className="p-4 border-b border-[#222125] flex items-center gap-3 bg-[#111012]">
          <Search className="w-5 h-5 text-[#ff4500] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search episodes, scripture passages, series, or speakers..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-[#6e6f77] focus:outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs text-[#6e6f77] hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Dynamic Content Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5">
          {/* Active Audio Telemetry Dock if episode is playing */}
          {currentEpisode && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#171110] via-[#141315] to-[#121113] border border-[#ff4500]/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-[#2a2929]">
                  <Image
                    src={currentEpisode.artworkUrl}
                    alt={currentEpisode.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#ffb13b] uppercase">
                      Now Broadcasting
                    </span>
                    <AudioVisualizer variant="mini" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-white truncate">
                    {currentEpisode.title}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => skipBackward(15)}
                  className="p-1.5 rounded-lg bg-[#1c1b1e] hover:bg-[#252428] text-[#a5a6af] hover:text-white text-xs font-mono"
                  title="Rewind 15s"
                >
                  -15s
                </button>
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-full bg-[#ff4500] text-black hover:scale-105 transition-all shadow-[0_0_12px_rgba(255,69,0,0.5)]"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
                <button
                  onClick={() => skipForward(30)}
                  className="p-1.5 rounded-lg bg-[#1c1b1e] hover:bg-[#252428] text-[#a5a6af] hover:text-white text-xs font-mono"
                  title="Forward 30s"
                >
                  +30s
                </button>
              </div>
            </div>
          )}

          {/* Search Results */}
          {query.trim() && (
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-[#a5a6af] mb-2">
                Search Matches ({filteredEpisodes.length})
              </p>
              {filteredEpisodes.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#6e6f77] font-mono">
                  No frequency match found for &quot;{query}&quot;. Try &quot;Romans&quot;, &quot;Faith&quot;, or &quot;Iron&quot;.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredEpisodes.slice(0, 6).map((ep) => (
                    <div
                      key={ep.id}
                      onClick={() => handleSelectEpisode(ep)}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-[#161518] hover:bg-[#201f24] border border-[#262529] hover:border-[#ff4500]/50 cursor-pointer transition-all group"
                    >
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[#2a2929]">
                        <Image
                          src={ep.artworkUrl}
                          alt={ep.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-[#ffb13b]">
                            {ep.seriesTitle}
                          </span>
                          <span className="text-[10px] text-[#6e6f77] font-mono">
                            • {formatTime(ep.durationSeconds)}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#ff4500] truncate">
                          {ep.title}
                        </h4>
                      </div>
                      <Play className="w-4 h-4 text-[#ff4500] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Spiritual Frequency Tuner Matrix */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#a5a6af] flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#ff4500]" />
                Spiritual Harmonic Tuner
              </span>
              <span className="text-[10px] font-mono text-[#ffb13b]">
                {activeFrequency}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { name: "396 Hz Grace", theme: "Liberation" },
                { name: "432 Hz Peace", theme: "Stillness" },
                { name: "528 Hz Restore", theme: "Renewal" },
                { name: "852 Hz Wisdom", theme: "Clarity" },
              ].map((freq) => (
                <button
                  key={freq.name}
                  onClick={() => setActiveFrequency(freq.name)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    activeFrequency === freq.name
                      ? "bg-[#ff4500]/15 border-[#ff4500] text-white shadow-[0_0_12px_rgba(255,69,0,0.3)]"
                      : "bg-[#141316] border-[#252428] text-[#a5a6af] hover:border-[#ff4500]/40 hover:text-white"
                  }`}
                >
                  <p className="text-[11px] font-mono font-bold">{freq.name}</p>
                  <p className="text-[10px] text-[#6e6f77]">{freq.theme}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Quick HUD Navigation Shortcuts */}
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#a5a6af] block mb-2">
              Quick System Navigation
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => handleNavigate("/browse")}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-[#141316] hover:bg-[#1f1e22] border border-[#252428] hover:border-[#ff4500]/40 text-left text-xs text-white transition-all"
              >
                <Compass className="w-4 h-4 text-[#ff4500]" />
                <span>Browse All Shows</span>
              </button>
              <button
                onClick={() => handleNavigate("/scripture")}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-[#141316] hover:bg-[#1f1e22] border border-[#252428] hover:border-[#ff4500]/40 text-left text-xs text-white transition-all"
              >
                <BookOpen className="w-4 h-4 text-[#ffb13b]" />
                <span className="font-cinzel text-xs font-bold">Scripture Index</span>
              </button>
              <button
                onClick={() => handleNavigate("/series")}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-[#141316] hover:bg-[#1f1e22] border border-[#252428] hover:border-[#ff4500]/40 text-left text-xs text-white transition-all"
              >
                <Layers className="w-4 h-4 text-[#ff4500]" />
                <span>Series Catalog</span>
              </button>
              {canAccessStudio && (
                <button
                  onClick={() => handleNavigate("/studio")}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-[#ff4500]/10 hover:bg-[#ff4500]/20 border border-[#ff4500]/40 text-left text-xs text-[#ffb13b] transition-all font-mono font-bold"
                >
                  <Flame className="w-4 h-4 text-[#ff4500] animate-pulse" />
                  <span>Launch Studio</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Hotkey Guide */}
        <div className="px-4 py-2.5 bg-[#111013] border-t border-[#222125] flex items-center justify-between text-[10px] font-mono text-[#6e6f77]">
          <div className="flex items-center gap-4">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#1c1b1f] text-white border border-[#2a292f]">ESC</kbd> Close
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#1c1b1f] text-white border border-[#2a292f]">SPACE</kbd> Play/Pause
            </span>
          </div>
          <span className="text-[#a5a6af]">Gospel Forge Telemetry System</span>
        </div>
      </div>
    </div>
  );
}
