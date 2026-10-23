"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Radio, Play, Sparkles, BookOpen, ChevronRight, Flame } from "lucide-react";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { usePodcastStore } from "@/context/PodcastStoreContext";
import { AudioVisualizer } from "@/components/audio/AudioVisualizer";

interface FrequencyBand {
  hz: string;
  theme: string;
  verseRef: string;
  passage: string;
  episodeIndex: number;
}

const FREQUENCY_BANDS: FrequencyBand[] = [
  {
    hz: "432 Hz",
    theme: "Peace & Divine Stillness",
    verseRef: "Psalm 46:10",
    passage: "Be still, and know that I am God; I will be exalted among the nations.",
    episodeIndex: 0,
  },
  {
    hz: "528 Hz",
    theme: "Restoration & Transformation",
    verseRef: "Romans 12:2",
    passage: "Do not conform to the pattern of this world, but be transformed by the renewing of your mind.",
    episodeIndex: 1,
  },
  {
    hz: "396 Hz",
    theme: "Liberation & Grace",
    verseRef: "Romans 8:1",
    passage: "There is now no condemnation for those who are in Christ Jesus.",
    episodeIndex: 2,
  },
  {
    hz: "639 Hz",
    theme: "Fellowship & Community",
    verseRef: "Hebrews 10:24",
    passage: "Let us consider how we may spur one another on toward love and good deeds.",
    episodeIndex: 3,
  },
  {
    hz: "852 Hz",
    theme: "Spiritual Wisdom & Clarity",
    verseRef: "Proverbs 3:5-6",
    passage: "Trust in the Lord with all your heart and lean not on your own understanding.",
    episodeIndex: 4,
  },
];

export function ScriptureFrequencyTuner() {
  const [selectedBand, setSelectedBand] = useState<FrequencyBand>(FREQUENCY_BANDS[0]);
  const { playEpisode, currentEpisode, isPlaying } = useAudioPlayer();
  const { getPublishedEpisodes } = usePodcastStore();
  const publishedEpisodes = getPublishedEpisodes();

  const targetEpisode =
    publishedEpisodes.length > 0
      ? publishedEpisodes[selectedBand.episodeIndex % publishedEpisodes.length]
      : null;

  const handleTuneAndListen = (band: FrequencyBand) => {
    setSelectedBand(band);
    if (publishedEpisodes.length > 0) {
      const ep = publishedEpisodes[band.episodeIndex % publishedEpisodes.length];
      playEpisode(ep);
    }
  };

  const isCurrentPlaying =
    Boolean(currentEpisode && targetEpisode && currentEpisode.id === targetEpisode.id && isPlaying);

  return (
    <section className="px-4 md:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#141215] via-[#100f12] to-[#0a090b] border border-[#ff4500]/30 p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff4500]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#8f1609]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header HUD row */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#252329]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c1a20] border border-[#ff4500]/40 text-[#ffb13b] text-xs font-mono tracking-wider uppercase mb-2">
              <Radio className="w-3.5 h-3.5 text-[#ff4500] animate-pulse" />
              <span>Spiritual Harmonic Tuner // 48kHz Hi-Fi</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              THE SCRIPTURE FREQUENCY MATRIX
            </h2>
            <p className="text-xs sm:text-sm text-[#a5a6af] mt-1 font-body">
              Every biblical truth carries a spiritual harmonic. Select a resonance to tune your focus and anchor your soul.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <AudioVisualizer variant="dock" className="w-36 h-8 hidden sm:block" />
            <Link
              href="/scripture"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1c1b1f] hover:bg-[#25242a] border border-[#2a2931] hover:border-[#ff4500]/50 text-xs font-mono text-[#a5a6af] hover:text-white transition-all shrink-0"
            >
              <span>Full Scripture Index</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Tuner Dial Grid */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-6 mb-8">
          {FREQUENCY_BANDS.map((band) => {
            const isSelected = selectedBand.hz === band.hz;
            return (
              <button
                key={band.hz}
                onClick={() => setSelectedBand(band)}
                className={`p-4 rounded-2xl text-left transition-all duration-300 relative group overflow-hidden ${
                  isSelected
                    ? "bg-gradient-to-b from-[#241a18] to-[#161214] border-2 border-[#ff4500] shadow-[0_0_25px_rgba(255,69,0,0.35)] scale-[1.02]"
                    : "bg-[#141316]/90 hover:bg-[#1a191d] border border-[#26242a] hover:border-[#ff4500]/40"
                }`}
              >
                {/* Active selection indicator line */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff4500] via-[#ffb13b] to-[#ff4500]" />
                )}

                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs sm:text-sm font-bold text-white tracking-wider">
                    {band.hz}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSelected
                        ? "bg-[#ff4500] shadow-[0_0_8px_#ff4500] animate-pulse"
                        : "bg-[#333238]"
                    }`}
                  />
                </div>

                <p className="font-heading text-xs font-bold text-[#ffb13b] line-clamp-1 mb-1">
                  {band.theme}
                </p>

                <p className="font-cinzel text-[11px] font-semibold text-[#a5a6af] group-hover:text-white transition-colors">
                  {band.verseRef}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected Frequency Showcase Card */}
        <div className="relative z-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#171212] via-[#141215] to-[#100f12] border border-[#ff4500]/30 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-md bg-[#ff4500]/20 border border-[#ff4500]/40 text-[#ffb13b] text-xs font-mono font-bold">
                {selectedBand.hz} FREQUENCY
              </span>
              <span className="font-cinzel text-sm sm:text-base font-bold text-white tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#ff4500]" />
                {selectedBand.verseRef}
              </span>
            </div>

            {/* Scripture quote in Cinzel */}
            <blockquote className="font-cinzel text-base sm:text-xl lg:text-2xl text-[#f5f0ea] leading-relaxed italic border-l-2 border-[#ff4500] pl-4 sm:pl-6 my-2 text-glow-ember">
              &ldquo;{selectedBand.passage}&rdquo;
            </blockquote>

            <p className="text-xs sm:text-sm text-[#a5a6af] font-body">
              Spiritual theme: <span className="text-white font-medium">{selectedBand.theme}</span>. Stream the dedicated forge sermon aligned with this biblical truth.
            </p>
          </div>

          {/* Action Button */}
          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={() => handleTuneAndListen(selectedBand)}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#ff4500] to-[#ffb13b] text-[#080706] font-heading font-bold text-xs sm:text-sm tracking-wider uppercase hover:shadow-[0_0_30px_rgba(255,69,0,0.7)] hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>{isCurrentPlaying && isPlaying ? "Broadcasting Live" : "Tune & Listen"}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
