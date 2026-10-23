"use client";

import React from "react";
import Link from "next/link";
import { Calendar, Clock, PlusCircle } from "lucide-react";
import { usePodcastStore } from "@/context/PodcastStoreContext";
import { formatDate } from "@/lib/utils";

export default function StudioScheduledReleasesPage() {
  const { episodes } = usePodcastStore();
  const scheduledEpisodes = episodes.filter((e) => e.status === "scheduled");

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-white tracking-wide">
            Scheduled Releases
          </h1>
          <p className="text-sm text-[#a5a6af] mt-1 font-body">
            Automated server-side publication queue timed for specific UTC release dates.
          </p>
        </div>
        <Link
          href="/studio/episodes/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff4500] text-black font-heading font-bold text-xs uppercase tracking-wider"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Schedule Episode</span>
        </Link>
      </div>

      {scheduledEpisodes.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#111113] border border-[#222123] text-[#6e6f77]">
          <Calendar className="w-8 h-8 text-[#ffb13b] mx-auto mb-2" />
          <p className="text-white font-medium">No Scheduled Releases</p>
          <p className="text-xs mt-1">
            Use the Episode Upload Wizard to schedule upcoming messages.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {scheduledEpisodes.map((ep) => (
            <div
              key={ep.id}
              className="p-5 rounded-2xl bg-[#111113] border border-[#222123] flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] font-mono uppercase text-[#ffb13b]">
                  {ep.seriesTitle}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{ep.title}</h3>
                <p className="text-xs text-[#a5a6af] mt-1 font-mono flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    Releasing:{" "}
                    {ep.scheduledPublishAt
                      ? formatDate(ep.scheduledPublishAt)
                      : "Pending"}
                  </span>
                </p>
              </div>

              <Link
                href={`/studio/episodes/${ep.id}/edit`}
                className="px-3 py-1.5 rounded-lg bg-[#181719] text-xs font-mono text-white border border-[#2a2929]"
              >
                Reschedule
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
