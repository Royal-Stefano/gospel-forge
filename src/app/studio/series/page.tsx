"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Layers, Plus, ExternalLink } from "lucide-react";
import { usePodcastStore } from "@/context/PodcastStoreContext";

export default function StudioSeriesPage() {
  const { seriesList, episodes } = usePodcastStore();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-white tracking-wide">
            Podcast Series
          </h1>
          <p className="text-sm text-[#a5a6af] mt-1 font-body">
            Flagship audio show franchises and serialized discipleship teachings.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff4500] text-black font-heading font-bold text-xs uppercase tracking-wider">
          <Plus className="w-4 h-4" />
          <span>New Series</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {seriesList.map((series) => {
          const episodeCount = episodes.filter((e) => e.seriesId === series.id).length;
          return (
            <div
              key={series.id}
              className="p-5 rounded-3xl bg-[#111113] border border-[#222123] hover:border-[#ff4500]/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-[#2a2929]">
                  <Image
                    src={series.artworkUrl}
                    alt={series.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-[#ffb13b] uppercase">
                    {series.category}
                  </span>
                  <h3 className="text-base font-bold text-white truncate">
                    {series.title}
                  </h3>
                  <p className="text-xs text-[#a5a6af]">Host: {series.hostName}</p>
                </div>
              </div>

              <p className="text-xs text-[#a5a6af] line-clamp-2 font-body">
                {series.description}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-[#1e1d1f] text-xs font-mono">
                <span className="text-[#6e6f77]">{episodeCount} published eps</span>
                <Link
                  href={`/series/${series.slug}`}
                  target="_blank"
                  className="text-[#ff4500] hover:underline flex items-center gap-1"
                >
                  <span>Public View</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
