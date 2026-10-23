"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter, Sparkles } from "lucide-react";
import { EpisodeCard } from "@/components/podcast/EpisodeCard";
import { SeriesCard } from "@/components/podcast/SeriesCard";
import { SERIES_LIST, EPISODES } from "@/data/mockData";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "All",
  "Faith",
  "Bible",
  "Life",
  "Worship",
  "Culture",
  "Youth",
  "Relationships",
];

function BrowseContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredEpisodes = useMemo(() => {
    return EPISODES.filter((ep) => {
      const matchesSearch =
        searchQuery === "" ||
        ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.seriesTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.speaker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.topics.some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        ep.scriptureReferences.some((s) =>
          s.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCat =
        selectedCategory === "All" ||
        ep.topics.some(
          (t) => t.toLowerCase() === selectedCategory.toLowerCase()
        ) ||
        ep.seriesTitle.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="px-4 md:px-8 py-6 space-y-8">
      {/* Title & Description */}
      <div>
        <h1 className="font-heading text-3xl font-extrabold text-white tracking-wide">
          Browse
        </h1>
        <p className="text-sm text-[#a5a6af] mt-1">
          Explore Christian podcasts, topics, and voices from around the world.
        </p>
      </div>

      {/* Filter Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-heading font-medium tracking-wide transition-all whitespace-nowrap",
              selectedCategory === cat
                ? "bg-[#ff4500] text-black font-bold shadow-[0_0_15px_rgba(255,69,0,0.4)]"
                : "bg-[#161517] text-[#a5a6af] hover:text-white hover:bg-[#201f22] border border-[#262527]"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Popular Series Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-bold text-white tracking-wide">
            Popular Series
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {SERIES_LIST.map((series) => (
            <SeriesCard key={series.id} series={series} />
          ))}
        </div>
      </section>

      {/* Featured / Filtered Episodes */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <span>
              {searchQuery
                ? `Results for "${searchQuery}"`
                : selectedCategory === "All"
                ? "Featured Episodes"
                : `${selectedCategory} Episodes`}
            </span>
            <span className="text-xs font-mono text-[#6e6f77]">
              ({filteredEpisodes.length})
            </span>
          </h2>
        </div>

        {filteredEpisodes.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-[#111113] border border-[#222123] p-8">
            <p className="text-base text-white font-medium">No episodes found</p>
            <p className="text-xs text-[#a5a6af] mt-1">
              Try adjusting your search query or selected category
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold rounded-full bg-[#1c1b1b] text-[#ff4500] border border-[#2a2929]"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredEpisodes.map((ep) => (
              <EpisodeCard key={ep.id} episode={ep} variant="vertical" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="p-8 text-white">Loading Browse...</div>}>
      <BrowseContent />
    </Suspense>
  );
}
