"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Mic, Users, Compass } from "lucide-react";
import { usePodcastStore } from "@/context/PodcastStoreContext";

export default function SpeakersPage() {
  const { speakers, isLoading } = usePodcastStore();

  return (
    <div className="px-4 md:px-8 py-6 space-y-8 pb-16">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-[#ff4500]/15 text-[#ff4500] border border-[#ff4500]/30">
          <Mic className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-white tracking-wide">
            Speakers & Teachers
          </h1>
          <p className="text-sm text-[#a5a6af] mt-0.5">
            Hear from pastors, theologians, and leaders preaching sound doctrine.
          </p>
        </div>
      </div>

      {speakers.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#121113] border border-[#222123] text-center max-w-md mx-auto space-y-4">
          <Users className="w-8 h-8 text-[#ff4500] mx-auto opacity-75" />
          <h3 className="font-heading text-lg font-bold text-white">No Speakers Listed Yet</h3>
          <p className="text-xs text-[#a5a6af]">
            Verified creators, pastors, and podcast hosts will appear here once approved.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#ff4500] text-black font-heading font-bold text-xs uppercase tracking-wider hover:bg-[#e63900] transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Shows</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {speakers.map((speaker) => (
            <div
              key={speaker.id}
              className="p-6 rounded-3xl bg-[#121113] border border-[#222123] hover:border-[#ff4500]/40 transition-all flex flex-col items-center text-center space-y-4 group"
            >
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#ff4500]/40 group-hover:border-[#ff4500] shadow-[0_0_20px_rgba(255,69,0,0.3)] transition-all">
                <Image
                  src={speaker.avatarUrl}
                  alt={speaker.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-white group-hover:text-[#ffb13b] transition-colors">
                  {speaker.name}
                </h3>
                <p className="text-xs font-mono text-[#ff4500] mt-0.5">
                  {speaker.role}
                </p>
                <p className="text-xs text-[#a5a6af] mt-2 font-body line-clamp-3">
                  {speaker.bio}
                </p>
              </div>
              <div className="pt-2 border-t border-[#222123] w-full flex justify-between items-center text-xs font-mono text-[#6e6f77]">
                <span>Verified Teacher</span>
                <Link href={`/browse?q=${encodeURIComponent(speaker.name)}`} className="text-[#ffb13b] hover:text-white transition-colors">
                  View Messages
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
