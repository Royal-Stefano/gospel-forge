"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Sparkles, ChevronRight, Flame } from "lucide-react";
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

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.5 + 0.5,
        speedY: -(Math.random() * 0.8 + 0.3),
        speedX: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.7 + 0.2,
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
        ctx.shadowBlur = 8;
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
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#120a07] via-[#0d0908] to-[#080706] border border-[#ff4500]/20 mx-4 md:mx-8 my-6 p-6 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
      {/* Background Volcanic Rock and Glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#ff4500]/15 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#ff4500]/20 rounded-full blur-3xl pointer-events-none animate-ember-pulse" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#8f1609]/25 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Embers Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Headlines & CTAs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1c1b1b]/90 border border-[#ff4500]/40 text-[#ffb13b] text-xs font-mono tracking-widest uppercase shadow-[0_0_15px_rgba(255,69,0,0.2)]">
            <Flame className="w-3.5 h-3.5 text-[#ff4500] animate-pulse" />
            <span>The Gospel Audio Universe</span>
          </div>

          <div className="space-y-2">
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              FAITH HAS A{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4500] via-[#ffb13b] to-[#ff4500] text-glow-molten">
                FREQUENCY.
              </span>
            </h1>
            <p className="font-heading text-lg sm:text-xl font-bold tracking-widest text-[#a5a6af] uppercase">
              The Word. Amplified.
            </p>
          </div>

          <p className="text-sm sm:text-base text-[#a5a6af] max-w-xl font-body leading-relaxed">
            Stories, truths, and conversations that ignite a deeper faith.
            Forged in truth, produced for eternity.
          </p>

          {/* CTA Buttons matching reference design */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={handleStartListening}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#ff4500] to-[#ffb13b] text-[#080706] font-heading font-bold text-sm tracking-wider uppercase hover:shadow-[0_0_30px_rgba(255,69,0,0.7)] hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Start Listening</span>
            </button>

            <Link
              href="/browse"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#1c1b1b]/80 hover:bg-[#252426] border border-[#2e2d2f] hover:border-[#ff4500]/50 text-white font-heading font-semibold text-sm tracking-wider uppercase transition-all duration-300"
            >
              <span>Browse Shows</span>
              <ChevronRight className="w-4 h-4 text-[#a5a6af]" />
            </Link>
          </div>

          {/* Live metadata pill */}
          <div className="pt-4 flex items-center gap-6 text-xs font-mono text-[#6e6f77]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[#a5a6af]">Over 60+ Forged Episodes</span>
            </div>
            <span>•</span>
            <span className="text-[#ffb13b]">Continuous Hi-Fi Audio</span>
          </div>
        </div>

        {/* Right Column: Original Gospel Forge Metallic Fire Emblem */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 group">
            {/* Molten Glow ring behind logo */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-[#8f1609] via-[#ff4500] to-[#ffb13b] opacity-50 blur-2xl group-hover:opacity-80 transition-opacity duration-700 animate-pulse" />

            {/* Circular frame containing the authentic Gospel Forge Logo */}
            <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-[#ff4500]/40 shadow-[0_0_50px_rgba(255,69,0,0.4)] group-hover:border-[#ff4500] transition-all duration-500">
              <Image
                src="/images/gospel-forge-emblem.jpg"
                alt="Gospel Forge Sacred Emblem"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
