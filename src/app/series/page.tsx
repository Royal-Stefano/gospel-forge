"use client";

import React from "react";
import { SeriesCard } from "@/components/podcast/SeriesCard";
import { SERIES_LIST } from "@/data/mockData";

export default function SeriesListPage() {
  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-extrabold text-white tracking-wide">
          Series & Shows
        </h1>
        <p className="text-sm text-[#a5a6af] mt-1">
          Explore dedicated podcast series forged for truth, boldness, and faith.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {SERIES_LIST.map((series) => (
          <SeriesCard key={series.id} series={series} />
        ))}
      </div>
    </div>
  );
}
