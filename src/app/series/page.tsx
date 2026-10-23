"use client";

import React from "react";
import Link from "next/link";
import { Radio, Compass } from "lucide-react";
import { SeriesCard } from "@/components/podcast/SeriesCard";
import { usePodcastStore } from "@/context/PodcastStoreContext";

export default function SeriesListPage() {
  const { seriesList, isLoading } = usePodcastStore();

  return (
    <div className="px-4 md:px-8 py-6 space-y-6 pb-16">
      <div>
        <h1 className="font-heading text-3xl font-extrabold text-white tracking-wide">
          Series & Shows
        </h1>
        <p className="text-sm text-[#a5a6af] mt-1">
          Explore dedicated podcast series forged for truth, boldness, and faith.
        </p>
      </div>

      {seriesList.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#121113] border border-[#222123] text-center max-w-md mx-auto space-y-4">
          <Radio className="w-8 h-8 text-[#ff4500] mx-auto opacity-75" />
          <h3 className="font-heading text-lg font-bold text-white">No Series Published Yet</h3>
          <p className="text-xs text-[#a5a6af]">
            New podcast shows and expository series will be listed here as soon as published.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#ff4500] text-black font-heading font-bold text-xs uppercase tracking-wider hover:bg-[#e63900] transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Topics</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {seriesList.map((series) => (
            <SeriesCard key={series.id} series={series} />
          ))}
        </div>
      )}
    </div>
  );
}
