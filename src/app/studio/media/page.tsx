"use client";

import React from "react";
import { HardDrive, ShieldCheck, Database, Cloud, CheckCircle, ExternalLink } from "lucide-react";

export default function StudioMediaStoragePage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="font-heading text-3xl font-extrabold text-white tracking-wide">
          Media Storage Architecture
        </h1>
        <p className="text-sm text-[#a5a6af] mt-1 font-body">
          High-performance audio distribution, signed URL generation, and object storage tiers.
        </p>
      </div>

      {/* Storage Architecture Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-[#111113] border border-[#222123] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#ff4500]/15 text-[#ff4500] flex items-center justify-center">
            <Cloud className="w-5 h-5" />
          </div>
          <h3 className="font-heading text-base font-bold text-white">
            Direct Object Storage
          </h3>
          <p className="text-xs text-[#a5a6af] font-body leading-relaxed">
            Audio files bypass Hostinger application server memory and disk completely,
            uploading directly to Supabase S3-compatible object storage via signed URLs.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#111113] border border-[#222123] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-heading text-base font-bold text-white">
            Private Staging Bucket
          </h3>
          <p className="text-xs text-[#a5a6af] font-body leading-relaxed">
            Unpublished episode drafts remain in a private access-controlled bucket.
            Only authenticated staff with editor or admin roles can generate temporary preview streams.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#111113] border border-[#222123] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <h3 className="font-heading text-base font-bold text-white">
            Global Edge CDN Delivery
          </h3>
          <p className="text-xs text-[#a5a6af] font-body leading-relaxed">
            Published audio files are served through global edge caches with byte-range
            request support, enabling instantaneous seek and playback on mobile and desktop.
          </p>
        </div>
      </div>

      {/* Cost & Capacity Blueprint */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#111113] border border-[#222123] space-y-4">
        <h3 className="font-heading text-lg font-bold text-white">
          Durable Storage Specifications & Cost Projections
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-[#222123] text-[#6e6f77] uppercase">
              <tr>
                <th className="pb-3">Storage Tier</th>
                <th className="pb-3">Purpose</th>
                <th className="pb-3">Bucket Name</th>
                <th className="pb-3">Estimated Cost / Month</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181719] text-[#a5a6af]">
              <tr>
                <td className="py-3 text-white font-semibold">Audio Staging</td>
                <td className="py-3">Draft MP3 masters & raw uploads</td>
                <td className="py-3 text-[#ffb13b]">forge-audio-staging (Private)</td>
                <td className="py-3">$0.021 / GB</td>
              </tr>
              <tr>
                <td className="py-3 text-white font-semibold">Audio Production</td>
                <td className="py-3">Published podcast episodes & enclosures</td>
                <td className="py-3 text-emerald-400">forge-audio-public (Public CDN)</td>
                <td className="py-3">$0.021 / GB + Egress</td>
              </tr>
              <tr>
                <td className="py-3 text-white font-semibold">Cover Artwork</td>
                <td className="py-3">Episode & series cover images</td>
                <td className="py-3 text-blue-400">forge-artwork (Public CDN)</td>
                <td className="py-3">&lt; $1.00 / Month</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
