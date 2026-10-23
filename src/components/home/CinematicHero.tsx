"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Music, Users, BookOpen, Heart } from "lucide-react";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { EPISODES } from "@/data/mockData";

export function CinematicHero() {
  const { playEpisode } = useAudioPlayer();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Subtle floating ember particles effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      color: string;
    }> = [];

    const colors = ["#ff4500", "#ffb13b", "#8f1609", "#ffd700"];

    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        speedY: -(Math.random() * 0.7 + 0.2),
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.6 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleStartListening = () => {
    playEpisode(EPISODES[0]);
  };

  return (
    <section className="relative overflow-hidden rounded-3xl min-h-[380px] sm:min-h-[420px] md:min-h-[460px] mx-4 md:mx-8 mt-4 mb-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-[#ff4500]/25">
      {/* Background Cinematic Image (Sunset mountain with volcanic cross & traveler) */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-volcanic-cross.jpg"
          alt="The Gospel Audio Universe - Faith has a Frequency"
          fill
          className="object-cover object-right-top"
          priority
        />
        {/* Left Dark Gradient Overlay for optimal text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080706] via-[#080706]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080706] via-transparent to-black/30" />
      </div>

      {/* Floating Embers Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Foreground Content */}
      <div className="relative z-20 p-6 sm:p-10 md:p-12 flex flex-col justify-between h-full max-w-3xl space-y-8">
        <div className="space-y-4">
          {/* Tracking-widest Monospace Tag */}
          <p className="font-mono text-[11px] sm:text-xs text-[#ffb13b] tracking-[0.25em] uppercase font-bold">
            THE GOSPEL AUDIO UNIVERSE :
          </p>

          {/* Main Hero Title */}
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            FAITH HAS A{" "}
            <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-[#ff4500] via-[#ffb13b] to-[#ff4500] text-glow-molten">
              FREQUENCY.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-[#d0cfd6] font-sans max-w-xl">
            Stories, truths, and conversations that ignite a deeper faith.
          </p>

          {/* CTA Buttons matching reference design */}
          <div className="flex items-center gap-3.5 pt-2">
            <button
              onClick={handleStartListening}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#ff4500] to-[#e63900] text-white font-heading font-bold text-xs sm:text-sm tracking-wide hover:shadow-[0_0_25px_rgba(255,69,0,0.7)] hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Start Listening</span>
            </button>

            <Link
              href="/browse"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#121113]/85 hover:bg-[#1c1b1f] border border-[#2e2d33] hover:border-[#ff4500]/50 text-white font-heading font-semibold text-xs sm:text-sm tracking-wide transition-all duration-200 backdrop-blur-sm"
            >
              <span>Explore Shows</span>
            </Link>
          </div>
        </div>

        {/* 4 Feature Badges Row (Bottom of Hero matching image) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-[#2a292f]/60">
          {/* Feature 1 */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#ffb13b]/10 text-[#ffb13b] shrink-0 border border-[#ffb13b]/20">
              <Music className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="font-heading text-xs font-bold text-white truncate">
                Real Conversations
              </p>
              <p className="text-[10px] text-[#a5a6af] truncate">Life. Faith. Purpose.</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#ff4500]/10 text-[#ff4500] shrink-0 border border-[#ff4500]/20">
              <Users className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="font-heading text-xs font-bold text-white truncate">
                Powerful Voices
              </p>
              <p className="text-[10px] text-[#a5a6af] truncate">Pastors, creators, believers.</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#ffb13b]/10 text-[#ffb13b] shrink-0 border border-[#ffb13b]/20">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="font-heading text-xs font-bold text-white truncate">
                Rooted in Scripture
              </p>
              <p className="text-[10px] text-[#a5a6af] truncate">Truth for real life.</p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#ff4500]/10 text-[#ff4500] shrink-0 border border-[#ff4500]/20">
              <Heart className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="font-heading text-xs font-bold text-white truncate">
                A Growing Community
              </p>
              <p className="text-[10px] text-[#a5a6af] truncate">Listen. Learn. Connect.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
