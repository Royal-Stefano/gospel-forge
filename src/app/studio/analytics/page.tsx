"use client";

import React from "react";
import { BarChart3, TrendingUp, Radio, Smartphone, Globe, Info } from "lucide-react";
import { usePodcastStore } from "@/context/PodcastStoreContext";

export default function StudioAnalyticsPage() {
  const { episodes } = usePodcastStore();

  const totalPlays = episodes.reduce((acc, ep) => acc + (ep.playCount || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="font-heading text-3xl font-extrabold text-white tracking-wide">
          Studio Analytics & Insights
        </h1>
        <p className="text-sm text-[#a5a6af] mt-1 font-body">
          Listener engagement, streaming completions, and geographic distribution.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-[#111113] border border-[#222123] space-y-1">
          <span className="text-xs font-mono text-[#6e6f77] uppercase">
            Total Validated Streams
          </span>
          <p className="text-3xl font-bold font-mono text-white">
            {totalPlays.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-400 font-mono">
            +18.4% month-over-month
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-[#111113] border border-[#222123] space-y-1">
          <span className="text-xs font-mono text-[#6e6f77] uppercase">
            Average Completion Rate
          </span>
          <p className="text-3xl font-bold font-mono text-[#ffb13b]">74.2%</p>
          <span className="text-[11px] text-[#a5a6af] font-mono">
            High spiritual retention
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-[#111113] border border-[#222123] space-y-1">
          <span className="text-xs font-mono text-[#6e6f77] uppercase">
            Primary Device Share
          </span>
          <p className="text-3xl font-bold font-mono text-[#ff4500]">Mobile 68%</p>
          <span className="text-[11px] text-[#a5a6af] font-mono">
            Desktop 24% • Tablet 8%
          </span>
        </div>
      </div>

      {/* Top Episodes Table */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#111113] border border-[#222123] space-y-4">
        <h3 className="font-heading text-lg font-bold text-white">
          Highest Impact Messages
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-[#222123] text-[#6e6f77] uppercase">
              <tr>
                <th className="pb-3">Episode Title</th>
                <th className="pb-3">Series</th>
                <th className="pb-3">Total Listens</th>
                <th className="pb-3 text-right">Completion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181719]">
              {episodes.slice(0, 5).map((ep) => (
                <tr key={ep.id}>
                  <td className="py-3 font-semibold text-white">{ep.title}</td>
                  <td className="py-3 text-[#ffb13b]">{ep.seriesTitle}</td>
                  <td className="py-3 text-[#a5a6af]">
                    {ep.playCount?.toLocaleString() || "1,200"}
                  </td>
                  <td className="py-3 text-right text-emerald-400">78%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
