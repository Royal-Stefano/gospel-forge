"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Layers } from "lucide-react";
import { Series } from "@/types";

interface SeriesCardProps {
  series: Series;
}

export function SeriesCard({ series }: SeriesCardProps) {
  return (
    <Link
      href={`/series/${series.slug}`}
      className="group relative flex flex-col p-3 rounded-2xl bg-[#111113]/90 hover:bg-[#1a191b] border border-[#222123] hover:border-[#ff4500]/40 transition-all duration-300 hover:-translate-y-1 shadow-xl"
    >
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 border border-[#262527] bg-[#161517]">
        <Image
          src={series.artworkUrl}
          alt={series.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-mono text-[#f5f0ea]">
          <span className="bg-[#080706]/80 backdrop-blur-sm px-2 py-0.5 rounded border border-[#2a2929] flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#ff4500]" />
            {series.episodeCount} eps
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <h3 className="text-sm font-semibold text-white group-hover:text-[#ffb13b] transition-colors line-clamp-1">
          {series.title}
        </h3>
        <p className="text-xs text-[#a5a6af] mt-0.5">Hosted by {series.hostName}</p>
        <p className="text-xs text-[#6e6f77] line-clamp-2 mt-1 font-body">
          {series.description}
        </p>
      </div>
    </Link>
  );
}
