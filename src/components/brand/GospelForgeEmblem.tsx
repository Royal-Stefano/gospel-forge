import React from "react";
import { cn } from "@/lib/utils";

interface GospelForgeEmblemProps {
  className?: string;
  size?: number;
}

export function GospelForgeEmblem({
  className = "w-9 h-9",
  size = 36,
}: GospelForgeEmblemProps) {
  return (
    <div
      className={cn(
        "relative rounded-full flex items-center justify-center shrink-0 overflow-hidden shadow-[0_0_15px_rgba(255,69,0,0.35)]",
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Outer Ring Bronze/Gold Gradient */}
          <linearGradient id="gf-outer-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffb13b" />
            <stop offset="35%" stopColor="#d97706" />
            <stop offset="70%" stopColor="#ff4500" />
            <stop offset="100%" stopColor="#8f1609" />
          </linearGradient>

          {/* Core Forge Radial Glow */}
          <radialGradient id="gf-core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff7733" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#8f1609" stopOpacity="0.9" />
            <stop offset="85%" stopColor="#151318" stopOpacity="1" />
            <stop offset="100%" stopColor="#080706" stopOpacity="1" />
          </radialGradient>

          {/* Golden Cross Linear */}
          <linearGradient id="gf-cross-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff5eb" />
            <stop offset="30%" stopColor="#ffb13b" />
            <stop offset="70%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          {/* Molten Accent Flare */}
          <linearGradient id="gf-flare" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff4500" />
            <stop offset="50%" stopColor="#ffb13b" />
            <stop offset="100%" stopColor="#ff4500" />
          </linearGradient>
        </defs>

        {/* Outer Steel Bevel Ring */}
        <circle cx="50" cy="50" r="48" fill="#0c0a0e" stroke="url(#gf-outer-ring)" strokeWidth="3" />
        <circle cx="50" cy="50" r="44" stroke="#ff4500" strokeWidth="0.75" strokeOpacity="0.5" strokeDasharray="3 3" />

        {/* Center Volcanic Dais */}
        <circle cx="50" cy="50" r="41" fill="url(#gf-core-glow)" />

        {/* 8-Point Compass / Radiance Star Rays */}
        {/* Cardinal Rays */}
        <polygon points="50,11 53,42 50,47 47,42" fill="url(#gf-cross-gold)" opacity="0.9" />
        <polygon points="50,89 53,58 50,53 47,58" fill="url(#gf-cross-gold)" opacity="0.9" />
        <polygon points="11,50 42,47 47,50 42,53" fill="url(#gf-cross-gold)" opacity="0.9" />
        <polygon points="89,50 58,47 53,50 58,53" fill="url(#gf-cross-gold)" opacity="0.9" />

        {/* Diagonal Rays */}
        <polygon points="22,22 44,42 47,47 42,44" fill="url(#gf-flare)" opacity="0.7" />
        <polygon points="78,22 56,42 53,47 58,44" fill="url(#gf-flare)" opacity="0.7" />
        <polygon points="22,78 44,58 47,53 42,56" fill="url(#gf-flare)" opacity="0.7" />
        <polygon points="78,78 56,58 53,53 58,56" fill="url(#gf-flare)" opacity="0.7" />

        {/* Inner Gold Halo Ring */}
        <circle cx="50" cy="50" r="24" fill="none" stroke="url(#gf-cross-gold)" strokeWidth="1.5" strokeOpacity="0.8" />

        {/* Central Christian Cross with Sacred Bevel */}
        {/* Vertical Beam */}
        <rect x="47.5" y="24" width="5" height="52" rx="1" fill="url(#gf-cross-gold)" />
        {/* Horizontal Beam */}
        <rect x="30" y="38" width="40" height="5" rx="1" fill="url(#gf-cross-gold)" />

        {/* Central Nexus Ember Core */}
        <circle cx="50" cy="40.5" r="4" fill="#ffffff" />
        <circle cx="50" cy="40.5" r="2" fill="#ff4500" />
      </svg>
    </div>
  );
}
