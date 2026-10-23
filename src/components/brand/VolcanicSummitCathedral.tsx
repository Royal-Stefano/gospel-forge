import React from "react";
import { cn } from "@/lib/utils";

interface VolcanicSummitCathedralProps {
  className?: string;
  showCross?: boolean;
  intensity?: "subtle" | "medium" | "hero";
}

export function VolcanicSummitCathedral({
  className,
  showCross = true,
  intensity = "hero",
}: VolcanicSummitCathedralProps) {
  const opacity =
    intensity === "subtle" ? "opacity-25" : intensity === "medium" ? "opacity-45" : "opacity-80";

  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none overflow-hidden select-none",
        className
      )}
    >
      {/* 1. Atmospheric Deep Radial Sunset & Ember Glows */}
      <div className="absolute top-0 right-0 w-full lg:w-[75%] h-[550px] bg-[radial-gradient(ellipse_at_70%_20%,rgba(255,100,20,0.35)_0%,rgba(217,119,6,0.18)_30%,rgba(143,22,9,0.12)_55%,transparent_75%)] blur-2xl" />
      <div className="absolute top-0 right-[15%] w-[450px] h-[450px] bg-[radial-gradient(circle,rgba(255,177,59,0.3)_0%,rgba(255,69,0,0.15)_45%,transparent_70%)] blur-3xl animate-pulse" style={{ animationDuration: "8s" }} />

      {/* 2. Vector Mountain Ridge Silhouette with Summit Cross */}
      <svg
        viewBox="0 0 1440 600"
        className={cn("absolute bottom-0 right-0 w-full h-full object-cover", opacity)}
        preserveAspectRatio="xMidYMax slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Sky Gradient */}
          <linearGradient id="summit-sky" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#ff7733" stopOpacity="0.4" />
            <stop offset="40%" stopColor="#d95d1e" stopOpacity="0.25" />
            <stop offset="80%" stopColor="#3d140b" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#080706" stopOpacity="0" />
          </linearGradient>

          {/* Golden Divine Sunburst from Cross */}
          <radialGradient id="cross-sunburst" cx="72%" cy="32%" r="40%">
            <stop offset="0%" stopColor="#fff9e6" stopOpacity="0.9" />
            <stop offset="15%" stopColor="#ffb13b" stopOpacity="0.6" />
            <stop offset="45%" stopColor="#ff4500" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#080706" stopOpacity="0" />
          </radialGradient>

          {/* Distant Mountain Peak Fill */}
          <linearGradient id="ridge-far" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#281519" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0c0a0e" stopOpacity="0.95" />
          </linearGradient>

          {/* Fore Peak with Lava Fissure */}
          <linearGradient id="ridge-fore" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a1114" />
            <stop offset="100%" stopColor="#080706" />
          </linearGradient>

          {/* Molten Lava Fissure Glow */}
          <linearGradient id="lava-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff4500" />
            <stop offset="50%" stopColor="#ffb13b" />
            <stop offset="100%" stopColor="#e63900" />
          </linearGradient>
        </defs>

        {/* Divine Sunburst Halo behind Cross (centered at x=1036, y=192) */}
        <circle cx="1036" cy="192" r="320" fill="url(#cross-sunburst)" />

        {/* Radiant Divine Light Rays emanating from Cross */}
        <g opacity="0.45" stroke="#ffb13b" strokeWidth="1">
          <line x1="1036" y1="192" x2="600" y2="0" strokeOpacity="0.4" strokeDasharray="6 4" />
          <line x1="1036" y1="192" x2="800" y2="0" strokeOpacity="0.5" />
          <line x1="1036" y1="192" x2="1036" y2="0" strokeOpacity="0.7" strokeWidth="2" />
          <line x1="1036" y1="192" x2="1280" y2="0" strokeOpacity="0.5" />
          <line x1="1036" y1="192" x2="1440" y2="80" strokeOpacity="0.4" />
          <line x1="1036" y1="192" x2="1440" y2="280" strokeOpacity="0.3" strokeDasharray="4 4" />
          <line x1="1036" y1="192" x2="520" y2="180" strokeOpacity="0.3" />
        </g>

        {/* Distant Mountain Ridges */}
        <path
          d="M 350,600 L 580,380 L 760,430 L 960,290 L 1150,370 L 1320,310 L 1440,360 L 1440,600 Z"
          fill="url(#ridge-far)"
        />

        {/* Foreground Mountain Summit with Jagged Volcanic Crags */}
        <path
          d="M 0,600 L 0,520 Q 240,490 480,440 L 780,410 L 920,320 L 1036,250 L 1160,340 L 1340,460 L 1440,500 L 1440,600 Z"
          fill="url(#ridge-fore)"
        />

        {/* Molten Lava Fissures glowing through volcanic rocks */}
        <g stroke="url(#lava-glow)" strokeLinecap="round" opacity="0.85">
          <path d="M 1036,252 Q 1042,290 1025,330 T 1048,390 T 1070,450" strokeWidth="2.5" />
          <path d="M 1025,330 Q 980,360 950,420" strokeWidth="1.5" strokeOpacity="0.7" />
          <path d="M 1048,390 Q 1100,430 1140,470" strokeWidth="1.5" strokeOpacity="0.8" />
          <path d="M 820,440 Q 860,460 900,490" strokeWidth="1.5" strokeOpacity="0.5" />
        </g>

        {/* Christian Cross on Summit Peak */}
        {showCross && (
          <g filter="drop-shadow(0px 0px 12px rgba(255, 177, 59, 0.8))">
            {/* Center Pillar Cross */}
            {/* Vertical Timber Beam */}
            <rect x="1030" y="110" width="12" height="145" rx="2" fill="#0f0c10" stroke="#ffb13b" strokeWidth="1.5" />
            {/* Horizontal Cross Beam */}
            <rect x="985" y="145" width="102" height="12" rx="2" fill="#0f0c10" stroke="#ffb13b" strokeWidth="1.5" />
            {/* Golden Core Nexus */}
            <circle cx="1036" cy="151" r="5" fill="#ffb13b" />
          </g>
        )}
      </svg>

      {/* 3. Bottom Gradient Vignette Fade */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#080706] to-transparent" />
      <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#080706] to-transparent" />
    </div>
  );
}
