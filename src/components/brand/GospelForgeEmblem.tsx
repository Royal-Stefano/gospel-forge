import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface GospelForgeEmblemProps {
  className?: string;
  size?: number;
  priority?: boolean;
}

export function GospelForgeEmblem({
  className = "w-9 h-9",
  size,
  priority = false,
}: GospelForgeEmblemProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center shrink-0 drop-shadow-[0_0_12px_rgba(255,69,0,0.35)]",
        className
      )}
      style={size ? { width: size, height: size } : undefined}
    >
      <Image
        src="/images/gospel-forge-logo.png"
        alt="Gospel Forge"
        width={size ? size * 2 : 120}
        height={size ? size * 2 : 120}
        className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,69,0,0.45)]"
        priority={priority}
      />
    </div>
  );
}
