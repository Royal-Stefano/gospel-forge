"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, Search } from "lucide-react";
import { EPISODES } from "@/data/mockData";
import { EpisodeCard } from "@/components/podcast/EpisodeCard";

const SCRIPTURE_TOPICS = [
  { book: "Romans", passage: "Romans 8:28", title: "All Things for Good", episodes: 3 },
  { book: "James", passage: "James 1:2-4", title: "Count it Joy in Trials", episodes: 2 },
  { book: "Isaiah", passage: "Isaiah 48:10", title: "The Furnace of Affliction", episodes: 1 },
  { book: "Psalms", passage: "Psalm 27:1", title: "The Lord is My Light", episodes: 4 },
  { book: "Matthew", passage: "Matthew 6:33", title: "Seek First the Kingdom", episodes: 2 },
  { book: "Daniel", passage: "Daniel 1:8", title: "Standing in Babylon", episodes: 1 },
  { book: "1 Timothy", passage: "1 Timothy 4:12", title: "Set an Example for Believers", episodes: 2 },
  { book: "Philippians", passage: "Philippians 3:14", title: "Press Toward the Goal", episodes: 3 },
];

export default function ScripturePage() {
  const [selectedScripture, setSelectedScripture] = useState<string>("Romans 8:28");

  return (
    <div className="px-4 md:px-8 py-6 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-[#ff4500]/15 text-[#ff4500] border border-[#ff4500]/30">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-cinzel text-3xl font-extrabold text-white tracking-wide">
            Scripture Index
          </h1>
          <p className="text-sm text-[#a5a6af] mt-0.5">
            Browse episodes and sermons anchored in specific books and passages of the Bible.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SCRIPTURE_TOPICS.map((item) => (
          <div
            key={item.passage}
            onClick={() => setSelectedScripture(item.passage)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              selectedScripture === item.passage
                ? "bg-[#1c1410] border-[#ff4500] shadow-[0_0_15px_rgba(255,69,0,0.3)]"
                : "bg-[#121113] border-[#222123] hover:border-[#ff4500]/40"
            }`}
          >
            <div>
              <span className="text-[10px] font-mono uppercase text-[#ffb13b] font-bold">
                {item.book}
              </span>
              <h3 className="font-cinzel text-base font-bold text-white mt-0.5">
                {item.passage}
              </h3>
              <p className="text-xs text-[#a5a6af] mt-1 italic font-body">
                &ldquo;{item.title}&rdquo;
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#222123] flex items-center justify-between text-[11px] font-mono text-[#6e6f77]">
              <span>{item.episodes} episodes</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#ff4500]" />
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-heading text-xl font-bold text-white mb-4">
          Episodes anchored in {selectedScripture}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EPISODES.slice(0, 2).map((ep) => (
            <EpisodeCard key={ep.id} episode={ep} variant="vertical" />
          ))}
        </div>
      </div>
    </div>
  );
}
