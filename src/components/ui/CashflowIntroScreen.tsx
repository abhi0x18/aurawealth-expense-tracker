"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { triggerConfetti } from "@/lib/confetti";
import { Sparkles, X, Volume2 } from "lucide-react";

interface CashflowIntroScreenProps {
  onBegin: () => void;
  isOpen: boolean;
}

export function CashflowIntroScreen({ onBegin, isOpen }: CashflowIntroScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDismissing, setIsDismissing] = useState(false);

  // Play luxury golden coin/chime sound using Web Audio API
  const playGoldChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Primary crystal bell
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.12); // E6
      gain1.gain.setValueAtTime(0.45, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 1.3);

      // Shimmer harmonic sparkle
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(1760, now + 0.08); // A6
      osc2.frequency.exponentialRampToValueAtTime(2093, now + 0.2); // C7
      gain2.gain.setValueAtTime(0.35, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 1.0);
    } catch (_) {}
  }, []);

  // Handle Begin Trigger
  const handleStart = () => {
    if (isDismissing) return;
    setIsDismissing(true);
    playGoldChime();
    triggerConfetti();

    setTimeout(() => {
      onBegin();
      setIsDismissing(false);
    }, 700);
  };

  // Golden Floating Dust & Embers Particle Animation
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles: {
      x: number;
      y: number;
      radius: number;
      speedY: number;
      speedX: number;
      opacity: number;
      pulseSpeed: number;
    }[] = [];

    const count = Math.min(width < 768 ? 35 : 70, 80);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.8 + 1.2,
        speedY: Math.random() * 0.8 + 0.35,
        speedX: (Math.random() - 0.5) * 0.45,
        opacity: Math.random() * 0.7 + 0.25,
        pulseSpeed: Math.random() * 0.03 + 0.015,
      });
    }

    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += Math.sin(frame * 0.02 + p.y * 0.01) * p.speedX;
        p.opacity = 0.35 + Math.sin(frame * p.pulseSpeed) * 0.35;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        // Golden glowing gradient dot
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2);
        grad.addColorStop(0, `rgba(255, 238, 160, ${p.opacity})`);
        grad.addColorStop(0.5, `rgba(229, 178, 70, ${p.opacity * 0.6})`);
        grad.addColorStop(1, "rgba(200, 100, 0, 0)");

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden flex flex-col justify-center items-center select-none transition-all duration-700 ${
        isDismissing ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
      style={{
        backgroundImage: "url('/images/cashflow-hero.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onClick={handleStart}
    >
      {/* Dark Radial Vignette overlay to make gold UI pop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(10, 18, 12, 0.45) 0%, rgba(5, 10, 6, 0.82) 65%, rgba(2, 4, 3, 0.96) 100%)",
        }}
      />

      {/* Golden Floating Embers Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

      {/* Sci-Fi Luxury HUD Outer Frame */}
      <div
        className="absolute inset-4 sm:inset-6 pointer-events-none z-10 border border-amber-400/35 shadow-[inset_0_0_40px_rgba(212,175,55,0.15)]"
        style={{
          clipPath:
            "polygon(24px 0, calc(100% - 24px) 0, 100% 24px, 100% calc(100% - 24px), calc(100% - 24px) 100%, 24px 100%, 0 calc(100% - 24px), 0 24px)",
        }}
      />

      {/* Corner Accents */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 w-8 h-8 border-t-[3px] border-l-[3px] border-amber-300 pointer-events-none z-10 drop-shadow-[0_0_8px_rgba(255,215,0,0.7)]" />
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 w-8 h-8 border-t-[3px] border-r-[3px] border-amber-300 pointer-events-none z-10 drop-shadow-[0_0_8px_rgba(255,215,0,0.7)]" />
      <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 w-8 h-8 border-b-[3px] border-l-[3px] border-amber-300 pointer-events-none z-10 drop-shadow-[0_0_8px_rgba(255,215,0,0.7)]" />
      <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 w-8 h-8 border-b-[3px] border-r-[3px] border-amber-300 pointer-events-none z-10 drop-shadow-[0_0_8px_rgba(255,215,0,0.7)]" />

      {/* Quick Skip / Close button in top right */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleStart();
        }}
        className="absolute top-6 sm:top-8 right-6 sm:right-8 z-30 px-4 py-2 rounded-full glass-panel border border-amber-400/40 text-amber-200 hover:text-white hover:bg-amber-500/20 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
      >
        <span>Enter Directly</span>
        <X className="w-4 h-4" />
      </button>

      {/* Center Hero UI Assembly */}
      <div
        className="relative z-20 flex flex-col items-center text-center px-4 max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Golden Shield Crest */}
        <div className="relative w-36 sm:w-44 h-40 sm:h-48 mb-3 animate-float-slow drop-shadow-[0_16px_30px_rgba(0,0,0,0.9)] drop-shadow-[0_0_35px_rgba(255,200,60,0.45)]">
          <svg viewBox="0 0 200 220" width="100%" height="100%">
            <defs>
              <linearGradient id="shieldGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff8c7" />
                <stop offset="30%" stopColor="#e5b246" />
                <stop offset="65%" stopColor="#9e6b14" />
                <stop offset="100%" stopColor="#f7d574" />
              </linearGradient>
              <linearGradient id="shieldDarkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2b1e07" />
                <stop offset="100%" stopColor="#0a0803" />
              </linearGradient>
              <linearGradient id="goldEmblemGrad" x1="0%" y1="0%" x2="100%" y2="80%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#ffd86b" />
                <stop offset="75%" stopColor="#e5a932" />
                <stop offset="100%" stopColor="#b47414" />
              </linearGradient>
            </defs>

            {/* Outer Golden Shield Frame */}
            <path
              d="M100 12 L175 45 C175 120 155 168 100 205 C45 168 25 120 25 45 Z"
              fill="url(#shieldGoldGrad)"
              stroke="#fff9d6"
              strokeWidth="3.5"
            />

            {/* Inner Dark Shield Chamber */}
            <path
              d="M100 22 L165 52 C165 116 148 158 100 193 C52 158 35 116 35 52 Z"
              fill="url(#shieldDarkGrad)"
              stroke="#6d4b12"
              strokeWidth="2"
            />

            {/* Ornate Golden Acanthus / Laurels Flanking */}
            <g stroke="url(#shieldGoldGrad)" strokeWidth="2.5" fill="none" opacity="0.9">
              <path d="M22 135 C10 115 15 85 30 70" />
              <path d="M20 150 C5 125 10 95 24 80" />
              <path d="M178 135 C190 115 185 85 170 70" />
              <path d="M180 150 C195 125 190 95 176 80" />
            </g>

            {/* Center Monogram: $ intertwined with W and S */}
            <g id="crestMonogram" fill="url(#goldEmblemGrad)" filter="drop-shadow(0 2px 5px rgba(0,0,0,0.8))">
              {/* Grand 'W' */}
              <path d="M60 68 L73 138 L86 86 L100 122 L114 86 L127 138 L140 68 L126 68 L119 110 L108 78 L92 78 L81 110 L74 68 Z" />
              {/* Golden Dollar Spine Line */}
              <rect x="97" y="52" width="6" height="102" rx="3" fill="#ffffff" opacity="0.9" />
              <rect x="98" y="50" width="4" height="106" rx="2" fill="url(#shieldGoldGrad)" />
              {/* Dollar Top/Bottom S curves */}
              <path
                d="M86 76 C86 64 114 62 114 74 C114 88 84 90 84 108 C84 124 116 122 116 110"
                fill="none"
                stroke="url(#shieldGoldGrad)"
                strokeWidth="7"
                strokeLinecap="round"
              />
            </g>

            {/* Sparkle Star at Top */}
            <circle cx="100" cy="36" r="3" fill="#ffffff" />
            <polygon points="100,28 102,36 110,36 103,40 106,48 100,43 94,48 97,40 90,36 98,36" fill="#fff9d6" />
          </svg>
        </div>

        {/* Headline: CASHFLOW with 3D Gold-to-White gradient */}
        <h1
          className="font-cinzel font-black text-5xl sm:text-7xl lg:text-8xl tracking-widest uppercase drop-shadow-[0_8px_16px_rgba(0,0,0,0.95)]"
          style={{
            background:
              "linear-gradient(90deg, #e6b34b 0%, #fff2b2 26%, #d19a36 48%, #ffffff 58%, #e2e8f0 82%, #ffffff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "0.08em",
          }}
        >
          CASHFLOW
        </h1>

        {/* Subtitle: TAP INTO YOUR WEALTH */}
        <p
          className="font-montserrat font-black text-xl sm:text-2xl lg:text-3xl uppercase tracking-widest text-amber-200 mt-1 mb-1.5 drop-shadow-[0_4px_12px_rgba(255,190,40,0.7)]"
          style={{ letterSpacing: "0.15em" }}
        >
          TAP INTO YOUR WEALTH
        </p>

        {/* Tagline: THE WEALTH SIMULATOR */}
        <p
          className="font-montserrat font-bold text-sm sm:text-base lg:text-lg tracking-widest text-slate-200 drop-shadow-[0_3px_8px_rgba(0,0,0,0.95)] mb-8 sm:mb-10 uppercase opacity-90"
          style={{ letterSpacing: "0.22em" }}
        >
          THE WEALTH SIMULATOR
        </p>

        {/* Glowing "TAP TO BEGIN >" Outer Ring & Button */}
        <div
          onClick={handleStart}
          className="relative p-2 rounded-full cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95 group"
          style={{
            background: "linear-gradient(180deg, rgba(255, 225, 130, 0.85), rgba(180, 110, 20, 0.45))",
            boxShadow:
              "0 0 35px rgba(255, 175, 40, 0.65), inset 0 0 14px rgba(255, 230, 140, 0.8)",
          }}
        >
          {/* Pulsing Aura */}
          <div className="absolute inset-0 rounded-full animate-ping opacity-25 bg-amber-400 pointer-events-none" />

          {/* Golden Capsule Button with Glossy Sweep */}
          <button
            className="relative overflow-hidden flex items-center justify-center gap-4 sm:gap-6 px-10 sm:px-16 py-4 sm:py-5 rounded-full border-2 border-[#fff3b8] text-white font-montserrat font-black text-xl sm:text-3xl tracking-widest uppercase drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]"
            style={{
              background:
                "linear-gradient(180deg, #ffd86b 0%, #f39c12 45%, #c86400 85%, #e67e22 100%)",
              boxShadow:
                "inset 0 4px 8px rgba(255, 255, 255, 0.8), inset 0 -5px 12px rgba(90, 35, 0, 0.75)",
            }}
          >
            {/* Shimmer Light Reflection Sweep */}
            <span
              className="absolute top-0 -left-full w-2/3 h-full pointer-events-none transform -skew-x-25 animate-shimmer"
              style={{
                background:
                  "linear-gradient(115deg, transparent 0%, rgba(255, 255, 255, 0.75) 50%, transparent 100%)",
              }}
            />

            <span className="relative z-10">TAP TO BEGIN</span>
            <span className="relative z-10 inline-block text-2xl sm:text-3xl font-mono animate-bounce">
              &gt;
            </span>
          </button>
        </div>

        {/* Footer Prompt */}
        <p className="mt-6 text-xs sm:text-sm text-amber-100/90 tracking-wider font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] animate-pulse">
          Please tap the screen to start your journey.
        </p>
      </div>
    </div>
  );
}
