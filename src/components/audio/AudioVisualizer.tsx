"use client";

import React, { useEffect, useRef } from "react";
import { useAudioPlayer } from "@/context/AudioPlayerContext";

interface AudioVisualizerProps {
  variant?: "mini" | "dock" | "full";
  className?: string;
  barsCount?: number;
}

export function AudioVisualizer({
  variant = "mini",
  className = "",
  barsCount = 24,
}: AudioVisualizerProps) {
  const { isPlaying } = useAudioPlayer();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio || 200);
    let height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio || 50);

    const count = variant === "mini" ? 12 : variant === "dock" ? 20 : barsCount;
    const barWidth = width / count - 2;

    // Smoothed bar values
    const currentValues = new Array(count).fill(0.15);
    const targetValues = new Array(count).fill(0.15);

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Periodically update target heights based on simulated spectral physics
      if (isPlaying) {
        if (frame % 3 === 0) {
          for (let i = 0; i < count; i++) {
            // Emulate audio frequency distribution (higher bass, tapered highs with dynamic rhythm)
            const bassBoost = i < count * 0.3 ? 0.35 : 0;
            const midEnergy = Math.sin((frame * 0.08) + i * 0.4) * 0.3 + 0.4;
            const highSparkle = Math.random() * 0.25;
            targetValues[i] = Math.min(1, Math.max(0.1, bassBoost + midEnergy + highSparkle));
          }
        }
      } else {
        // Subtle resting idle wave
        for (let i = 0; i < count; i++) {
          targetValues[i] = 0.08 + Math.sin(frame * 0.03 + i * 0.5) * 0.05;
        }
      }

      // Draw bars with molten gradients & peak caps
      for (let i = 0; i < count; i++) {
        // Interpolate smoothly
        currentValues[i] += (targetValues[i] - currentValues[i]) * 0.22;
        const barHeight = Math.max(3, currentValues[i] * (height - 6));
        const x = i * (barWidth + 2);
        const y = height - barHeight;

        // Molten Forge Gradient (Crimson base -> Molten Orange -> Ember Gold tips)
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, "#8f1609");
        gradient.addColorStop(0.5, "#ff4500");
        gradient.addColorStop(1, "#ffb13b");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        // Rounded bar top
        ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
        ctx.fill();

        // Glowing peak dot
        if (isPlaying && currentValues[i] > 0.4) {
          ctx.fillStyle = "#ffffff";
          ctx.shadowBlur = 6;
          ctx.shadowColor = "#ff4500";
          ctx.fillRect(x, Math.max(0, y - 3), barWidth, 1.5);
          ctx.shadowBlur = 0; // reset
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, variant, barsCount]);

  if (variant === "mini") {
    return (
      <div className={`flex items-end gap-1 h-3.5 select-none ${className}`}>
        <span
          className={`w-0.5 rounded-full bg-[#ff4500] ${
            isPlaying ? "animate-eq-1 h-3" : "h-1 opacity-50"
          }`}
        />
        <span
          className={`w-0.5 rounded-full bg-[#ffb13b] ${
            isPlaying ? "animate-eq-2 h-3.5" : "h-1 opacity-50"
          }`}
        />
        <span
          className={`w-0.5 rounded-full bg-[#ff4500] ${
            isPlaying ? "animate-eq-3 h-2" : "h-1 opacity-50"
          }`}
        />
        <span
          className={`w-0.5 rounded-full bg-[#ffb13b] ${
            isPlaying ? "animate-eq-4 h-3" : "h-1 opacity-50"
          }`}
        />
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none"
      />
    </div>
  );
}
