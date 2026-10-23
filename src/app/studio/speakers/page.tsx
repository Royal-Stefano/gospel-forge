"use client";

import React from "react";
import Image from "next/image";
import { Mic, Plus } from "lucide-react";
import { usePodcastStore } from "@/context/PodcastStoreContext";

export default function StudioSpeakersPage() {
  const { speakers, episodes } = usePodcastStore();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-white tracking-wide">
            Speakers & Teachers
          </h1>
          <p className="text-sm text-[#a5a6af] mt-1 font-body">
            Profiles, roles, and series assignments for podcast hosts.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff4500] text-black font-heading font-bold text-xs uppercase tracking-wider">
          <Plus className="w-4 h-4" />
          <span>New Speaker</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {speakers.map((speaker) => {
          const epCount = episodes.filter((e) => e.speaker.id === speaker.id).length;
          return (
            <div
              key={speaker.id}
              className="p-6 rounded-3xl bg-[#111113] border border-[#222123] flex flex-col items-center text-center space-y-4"
            >
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#ff4500]/50">
                <Image
                  src={speaker.avatarUrl}
                  alt={speaker.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-white">
                  {speaker.name}
                </h3>
                <p className="text-xs font-mono text-[#ff4500] mt-0.5">
                  {speaker.role}
                </p>
                <p className="text-xs text-[#a5a6af] mt-2 font-body line-clamp-2">
                  {speaker.bio}
                </p>
              </div>
              <div className="pt-2 border-t border-[#1f1e20] w-full text-xs font-mono text-[#6e6f77]">
                <span>{epCount} published messages</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
