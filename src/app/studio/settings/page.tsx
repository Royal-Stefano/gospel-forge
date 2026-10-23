"use client";

import React, { useState } from "react";
import { Settings, Rss, HardDrive, Key, CheckCircle, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function StudioSettingsPage() {
  const { currentUser } = useAuth();
  const [feedUrl, setFeedUrl] = useState(
    "https://anchor.fm/s/gospel-forge/podcast/rss"
  );
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="font-heading text-3xl font-extrabold text-white tracking-wide">
          Studio Platform Settings
        </h1>
        <p className="text-sm text-[#a5a6af] mt-1 font-body">
          Environment configuration, outbound podcast feeds, and storage credentials.
        </p>
      </div>

      {isSaved && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-mono flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Platform configuration updated.</span>
        </div>
      )}

      {/* Outbound Podcast RSS Feed */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#111113] border border-[#222123] space-y-4">
        <div className="flex items-center gap-2">
          <Rss className="w-5 h-5 text-[#ff4500]" />
          <h3 className="font-heading text-lg font-bold text-white">
            Outbound Podcast RSS Distribution
          </h3>
        </div>
        <p className="text-xs text-[#a5a6af] font-body leading-relaxed">
          Gospel Forge generates a standard iTunes-compliant podcast RSS 2.0 feed
          from all published episodes, ready for submission to Apple Podcasts, Spotify, and Amazon Music.
        </p>

        <div className="p-3 rounded-xl bg-[#161517] border border-[#262527] flex items-center justify-between text-xs font-mono">
          <span className="text-[#ffb13b] truncate">
            https://gospelforge.com/api/feed/podcast.xml
          </span>
          <a
            href="/api/feed/podcast.xml"
            target="_blank"
            className="text-[#ff4500] hover:underline flex items-center gap-1 shrink-0 ml-4"
          >
            <span>Inspect XML Feed</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Upstream RSS Ingest Feed */}
      <form
        onSubmit={handleSave}
        className="p-6 md:p-8 rounded-3xl bg-[#111113] border border-[#222123] space-y-4"
      >
        <div className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-[#ff4500]" />
          <h3 className="font-heading text-lg font-bold text-white">
            Upstream Podcast Ingestion Feed
          </h3>
        </div>
        <p className="text-xs text-[#a5a6af] font-body">
          Source RSS feed synchronized every 15 minutes by GitHub Actions.
        </p>

        <div className="space-y-1">
          <label className="text-xs font-mono text-[#a5a6af]">Feed URL</label>
          <input
            type="url"
            value={feedUrl}
            onChange={(e) => setFeedUrl(e.target.value)}
            className="w-full bg-[#161517] text-xs text-white p-2.5 rounded-xl border border-[#262527] font-mono focus:border-[#ff4500] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-full bg-[#ff4500] text-black font-heading font-bold text-xs uppercase tracking-wider"
        >
          Save Feed Settings
        </button>
      </form>
    </div>
  );
}
