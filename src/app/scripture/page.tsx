"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, Search, Radio, Sparkles, Filter } from "lucide-react";
import { EpisodeCard } from "@/components/podcast/EpisodeCard";
import { AudioVisualizer } from "@/components/audio/AudioVisualizer";
import { usePodcastStore } from "@/context/PodcastStoreContext";

const SCRIPTURE_TOPICS = [
  {
    book: "Romans",
    testament: "NT",
    passage: "Romans 8:28",
    title: "All Things for Good",
    quote: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
    frequency: "432 Hz",
    episodes: 3,
  },
  {
    book: "James",
    testament: "NT",
    passage: "James 1:2-4",
    title: "Count it Joy in Trials",
    quote: "Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance.",
    frequency: "528 Hz",
    episodes: 2,
  },
  {
    book: "Isaiah",
    testament: "OT",
    passage: "Isaiah 48:10",
    title: "The Furnace of Affliction",
    quote: "See, I have refined you, though not as silver; I have tested you in the furnace of affliction.",
    frequency: "396 Hz",
    episodes: 1,
  },
  {
    book: "Psalms",
    testament: "OT",
    passage: "Psalm 27:1",
    title: "The Lord is My Light",
    quote: "The Lord is my light and my salvation—whom shall I fear? The Lord is the stronghold of my life—of whom shall I be afraid?",
    frequency: "432 Hz",
    episodes: 4,
  },
  {
    book: "Matthew",
    testament: "NT",
    passage: "Matthew 6:33",
    title: "Seek First the Kingdom",
    quote: "But seek first his kingdom and his righteousness, and all these things will be given to you as well.",
    frequency: "639 Hz",
    episodes: 2,
  },
  {
    book: "Daniel",
    testament: "OT",
    passage: "Daniel 1:8",
    title: "Standing in Babylon",
    quote: "But Daniel resolved not to defile himself with the royal food and wine, and he asked the chief official for permission not to defile himself this way.",
    frequency: "852 Hz",
    episodes: 1,
  },
  {
    book: "1 Timothy",
    testament: "NT",
    passage: "1 Timothy 4:12",
    title: "Set an Example for Believers",
    quote: "Don’t let anyone look down on you because you are young, but set an example for the believers in speech, in conduct, in love, in faith and in purity.",
    frequency: "528 Hz",
    episodes: 2,
  },
  {
    book: "Philippians",
    testament: "NT",
    passage: "Philippians 3:14",
    title: "Press Toward the Goal",
    quote: "I press on toward the goal to win the prize for which God has called me heavenward in Christ Jesus.",
    frequency: "396 Hz",
    episodes: 3,
  },
];

export default function ScripturePage() {
  const { getPublishedEpisodes } = usePodcastStore();
  const publishedEpisodes = getPublishedEpisodes();
  const [selectedTopic, setSelectedTopic] = useState(SCRIPTURE_TOPICS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [testamentFilter, setTestamentFilter] = useState<"ALL" | "OT" | "NT">("ALL");

  const filteredTopics = SCRIPTURE_TOPICS.filter((t) => {
    const matchesQuery =
      t.passage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.book.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTestament =
      testamentFilter === "ALL" || t.testament === testamentFilter;
    return matchesQuery && matchesTestament;
  });

  return (
    <div className="px-4 md:px-8 py-6 space-y-10">
      {/* Header telemetry & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#222125]">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 rounded-2xl bg-[#ff4500]/15 text-[#ff4500] border border-[#ff4500]/30 shadow-[0_0_15px_rgba(255,69,0,0.2)]">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#ffb13b] uppercase tracking-wider">
                Canonical Biblical Index
              </span>
              <span className="text-[10px] text-[#6e6f77] font-mono">• 48kHz Hi-Fi</span>
            </div>
            <h1 className="font-cinzel text-3xl sm:text-4xl font-extrabold text-white tracking-wide">
              The Scripture Index
            </h1>
            <p className="text-sm text-[#a5a6af] mt-0.5 font-sans">
              Every message forged in the Word. Search and filter by biblical passage, theme, or spiritual harmonic frequency.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {(["ALL", "OT", "NT"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTestamentFilter(filter)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                testamentFilter === filter
                  ? "bg-[#ff4500] text-black font-bold shadow-[0_0_12px_rgba(255,69,0,0.5)]"
                  : "bg-[#141316] text-[#a5a6af] hover:text-white border border-[#252428]"
              }`}
            >
              {filter === "ALL" ? "All Testaments" : filter === "OT" ? "Old Testament" : "New Testament"}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e6f77]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter scriptures (e.g., Romans, Psalms, Joy)..."
          className="w-full bg-[#121113] text-sm text-white placeholder-[#6e6f77] pl-10 pr-4 py-2.5 rounded-xl border border-[#252428] focus:border-[#ff4500] focus:outline-none transition-all"
        />
      </div>

      {/* Grid of Passage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredTopics.map((item) => (
          <div
            key={item.passage}
            onClick={() => setSelectedTopic(item)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
              selectedTopic.passage === item.passage
                ? "bg-gradient-to-b from-[#221815] to-[#141215] border-[#ff4500] shadow-[0_0_20px_rgba(255,69,0,0.3)] scale-[1.01]"
                : "bg-[#121113] border-[#222125] hover:border-[#ff4500]/40 hover:bg-[#18171a]"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase text-[#ffb13b] font-bold">
                  {item.book} ({item.testament})
                </span>
                <span className="text-[10px] font-mono text-[#a5a6af] bg-[#1a191d] px-1.5 py-0.5 rounded border border-[#2a292f]">
                  {item.frequency}
                </span>
              </div>
              <h3 className="font-cinzel text-base font-bold text-white mt-1 group-hover:text-[#ffb13b] transition-colors">
                {item.passage}
              </h3>
              <p className="text-xs text-[#a5a6af] mt-1 font-body line-clamp-1">
                &ldquo;{item.title}&rdquo;
              </p>
            </div>
            <div className="mt-4 pt-2.5 border-t border-[#222125] flex items-center justify-between text-[11px] font-mono text-[#6e6f77]">
              <span>{item.episodes} episodes</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#ff4500] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Selected Scripture Anchor Showcase */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#171110] via-[#141215] to-[#0e0d0f] border border-[#ff4500]/30 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-md bg-[#ff4500]/20 border border-[#ff4500]/40 text-[#ffb13b] text-xs font-mono font-bold">
              {selectedTopic.frequency} HARMONIC
            </span>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white tracking-wide">
              {selectedTopic.passage}
            </h2>
          </div>
          <span className="font-mono text-xs text-[#a5a6af]">
            Theme: <span className="text-[#f5f0ea]">{selectedTopic.title}</span>
          </span>
        </div>

        <blockquote className="font-cinzel text-base sm:text-xl text-[#f5f0ea] leading-relaxed italic border-l-2 border-[#ff4500] pl-4 sm:pl-6 my-3 text-glow-ember">
          &ldquo;{selectedTopic.quote}&rdquo;
        </blockquote>

        <div className="pt-4 border-t border-[#252329]">
          <h3 className="font-heading text-base font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#ff4500]" />
            Broadcasting Episodes Anchored in {selectedTopic.passage}
          </h3>
          {publishedEpisodes.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#121113] border border-[#222125] text-center text-xs text-[#a5a6af]">
              No published episodes anchored in this passage yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {publishedEpisodes.slice(0, 4).map((ep) => (
                <EpisodeCard key={ep.id} episode={ep} variant="vertical" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
