"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { triggerConfetti } from "@/lib/confetti";
import { ShieldCheck, LogIn, LayoutDashboard } from "lucide-react";

export default function CashflowLandingPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check auth state in background
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setIsAuthenticated(!!data.authenticated);
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  // Web Audio API Golden Coin Chime Synthesizer
  const playGoldChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Primary golden bell chime
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.12); // E6
      gain1.gain.setValueAtTime(0.45, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 1.4);

      // Shimmer harmonic sparkle
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(1760, now + 0.08); // A6
      osc2.frequency.exponentialRampToValueAtTime(2093, now + 0.22); // C7
      gain2.gain.setValueAtTime(0.35, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 1.1);
    } catch (_) {}
  }, []);

  // Handle Game / Journey Start
  const startGame = () => {
    if (isStarting) return;
    setIsStarting(true);
    playGoldChime();
    triggerConfetti();

    setTimeout(() => {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }, 750);
  };

  // Particle Canvas: Floating Golden Embers & Dust
  useEffect(() => {
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

    const count = Math.min(width < 768 ? 40 : 75, 80);
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
  }, []);

  return (
    <div
      className={`screen-container relative w-screen h-screen overflow-hidden flex flex-col justify-center items-center select-none bg-[#070a07] transition-all duration-700 ${
        isStarting ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
      onClick={startGame}
    >
      <style jsx>{`
        .screen-container {
          background: url('/images/cashflow-hero.jpg') center/cover no-repeat;
          animation: bgZoom 22s ease-in-out infinite alternate;
        }

        @keyframes bgZoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.07); }
        }

        /* Dark radial overlay to make the UI pop */
        .vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at center,
            rgba(10, 18, 12, 0.45) 0%,
            rgba(5, 10, 6, 0.85) 70%,
            rgba(2, 4, 3, 0.96) 100%
          );
          z-index: 1;
        }

        /* HUD Sci-Fi / Luxury Outer Frame */
        .hud-frame {
          position: absolute;
          inset: 22px;
          border: 1.5px solid rgba(212, 175, 55, 0.35);
          clip-path: polygon(
            20px 0, calc(100% - 20px) 0, 100% 20px,
            100% calc(100% - 20px), calc(100% - 20px) 100%,
            20px 100%, 0 calc(100% - 20px), 0 20px
          );
          z-index: 2;
          pointer-events: none;
          box-shadow: inset 0 0 35px rgba(212, 175, 55, 0.12);
        }

        /* Corner Accents */
        .corner {
          position: absolute;
          width: 28px;
          height: 28px;
          border: 2.5px solid #f5d16c;
          z-index: 3;
          pointer-events: none;
          filter: drop-shadow(0 0 6px rgba(245, 209, 108, 0.6));
        }
        .tl { top: 18px; left: 18px; border-right: none; border-bottom: none; }
        .tr { top: 18px; right: 18px; border-left: none; border-bottom: none; }
        .bl { bottom: 18px; left: 18px; border-right: none; border-top: none; }
        .br { bottom: 18px; right: 18px; border-left: none; border-top: none; }

        /* Animated Gold Shield Crest */
        .shield-wrapper {
          position: relative;
          width: 155px;
          height: 175px;
          margin-bottom: 10px;
          animation: floatShield 4s ease-in-out infinite;
          filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.85))
                  drop-shadow(0 0 25px rgba(255, 195, 60, 0.35));
        }

        @keyframes floatShield {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-9px); }
        }

        /* Typography */
        .title {
          font-family: 'Cinzel', serif;
          font-size: clamp(2.8rem, 6.5vw, 5.2rem);
          font-weight: 900;
          letter-spacing: 5px;
          text-transform: uppercase;
          background: linear-gradient(
            90deg,
            #e6b34b 0%,
            #fff2b2 28%,
            #d19a36 48%,
            #ffffff 55%,
            #e2e8f0 78%,
            #ffffff 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.9));
          margin-bottom: 6px;
        }

        .subtitle {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(1rem, 2.2vw, 1.55rem);
          font-weight: 700;
          letter-spacing: 3.5px;
          color: #ffdf80;
          text-shadow: 0 2px 12px rgba(255, 190, 40, 0.65), 0 3px 6px rgba(0, 0, 0, 0.9);
          margin-bottom: 8px;
        }

        .tagline {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(0.8rem, 1.5vw, 1.05rem);
          font-weight: 700;
          letter-spacing: 3px;
          color: #e2e8f0;
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.95);
          margin-bottom: 38px;
        }

        /* Glowing "TAP TO BEGIN" Button */
        .btn-outer-ring {
          position: relative;
          padding: 7px;
          border-radius: 60px;
          background: linear-gradient(180deg, rgba(255, 225, 130, 0.8), rgba(180, 110, 20, 0.4));
          box-shadow: 0 0 25px rgba(255, 175, 40, 0.55), inset 0 0 12px rgba(255, 230, 140, 0.7);
          animation: pulseRing 2.5s infinite ease-in-out;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .btn-outer-ring:hover {
          transform: scale(1.05);
          box-shadow: 0 0 40px rgba(255, 195, 60, 0.85), inset 0 0 15px rgba(255, 240, 170, 0.9);
        }

        .btn-outer-ring:active {
          transform: scale(0.96);
        }

        @keyframes pulseRing {
          0%, 100% { box-shadow: 0 0 22px rgba(255, 175, 40, 0.5), 0 8px 25px rgba(0,0,0,0.8); }
          50% { box-shadow: 0 0 38px rgba(255, 205, 70, 0.85), 0 8px 30px rgba(0,0,0,0.9); }
        }

        .tap-btn {
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          padding: 18px 58px;
          border-radius: 50px;
          border: 2px solid #fff3b8;
          background: linear-gradient(180deg, #ffd86b 0%, #f39c12 45%, #c86400 85%, #e67e22 100%);
          box-shadow: inset 0 4px 8px rgba(255, 255, 255, 0.75),
                      inset 0 -5px 10px rgba(90, 35, 0, 0.7);
          color: #ffffff;
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(1.2rem, 2.5vw, 1.85rem);
          font-weight: 900;
          letter-spacing: 3px;
          text-transform: uppercase;
          text-shadow: 0 3px 5px rgba(0, 0, 0, 0.75);
          cursor: pointer;
        }

        /* Glossy Shimmer Sweep */
        .tap-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: -120%;
          width: 65%;
          height: 100%;
          background: linear-gradient(
            115deg,
            transparent 0%,
            rgba(255, 255, 255, 0.65) 50%,
            transparent 100%
          );
          transform: skewX(-25deg);
          animation: shimmerSweep 3.2s infinite;
        }

        @keyframes shimmerSweep {
          0% { left: -120%; }
          55%, 100% { left: 160%; }
        }

        .chevron {
          display: inline-block;
          font-size: 1.6rem;
          line-height: 1;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.7));
          animation: nudgeRight 1.4s infinite ease-in-out;
        }

        @keyframes nudgeRight {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(6px); }
        }

        /* Footer Prompt */
        .footer-prompt {
          margin-top: 24px;
          font-size: clamp(0.85rem, 1.4vw, 1.05rem);
          color: rgba(255, 238, 190, 0.85);
          letter-spacing: 0.8px;
          text-shadow: 0 2px 5px rgba(0, 0, 0, 0.95);
          animation: fadeBlink 2.8s infinite ease-in-out;
        }

        @keyframes fadeBlink {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {/* Dark Vignette Overlay */}
      <div className="vignette" />

      {/* Particle Canvas */}
      <canvas id="particles" ref={canvasRef} />

      {/* HUD Border Frame */}
      <div className="hud-frame" />
      <div className="corner tl" />
      <div className="corner tr" />
      <div className="corner bl" />
      <div className="corner br" />

      {/* Quick Direct Access Buttons in top header */}
      <div className="absolute top-7 right-8 z-20 flex items-center gap-3">
        {isAuthenticated ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push("/dashboard");
            }}
            className="px-4 py-2 rounded-full glass-panel border border-amber-400/40 text-amber-200 hover:text-white hover:bg-amber-500/20 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-400" />
            <span>Go to Cockpit</span>
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push("/login");
            }}
            className="px-4 py-2 rounded-full glass-panel border border-amber-400/40 text-amber-200 hover:text-white hover:bg-amber-500/20 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
          >
            <LogIn className="w-4 h-4 text-amber-400" />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>

      {/* Center UI Content */}
      <div className="ui-content relative z-10 flex flex-col items-center text-center p-5" onClick={(e) => e.stopPropagation()}>
        {/* Animated Gold Shield Crest Emblem */}
        <div className="shield-wrapper">
          <svg viewBox="0 0 200 220" width="100%" height="100%">
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff4b8" />
                <stop offset="35%" stopColor="#e5b246" />
                <stop offset="70%" stopColor="#9e6b14" />
                <stop offset="100%" stopColor="#f7d574" />
              </linearGradient>
              <linearGradient id="innerDark" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2b210e" />
                <stop offset="100%" stopColor="#0d0903" />
              </linearGradient>
              <linearGradient id="goldTextGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="45%" stopColor="#ffd86b" />
                <stop offset="80%" stopColor="#e5a932" />
                <stop offset="100%" stopColor="#b47414" />
              </linearGradient>
            </defs>

            {/* Outer Shield */}
            <path
              d="M100 12 L175 45 C175 120 155 168 100 205 C45 168 25 120 25 45 Z"
              fill="url(#goldGrad)"
              stroke="#fff6c7"
              strokeWidth="3"
            />

            {/* Inner Shield */}
            <path
              d="M100 24 L163 52 C163 115 146 156 100 190 C54 156 37 115 37 52 Z"
              fill="url(#innerDark)"
              stroke="#755018"
              strokeWidth="2"
            />

            {/* Ornate Gold Filigree Foliage */}
            <g stroke="url(#goldGrad)" strokeWidth="2.5" fill="none" opacity="0.95">
              <path d="M22 135 C10 115 15 85 30 70" />
              <path d="M20 150 C5 125 10 95 24 80" />
              <path d="M178 135 C190 115 185 85 170 70" />
              <path d="M180 150 C195 125 190 95 176 80" />
            </g>

            {/* Monogram: $ intertwined with WS */}
            <g id="crestMonogram" fill="url(#goldTextGrad)" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.85))">
              <path d="M60 70 L73 138 L86 86 L100 122 L114 86 L127 138 L140 70 L126 70 L119 110 L108 78 L92 78 L81 110 L74 70 Z" />
              {/* Dollar Vertical Spine */}
              <rect x="97" y="52" width="6" height="102" rx="3" fill="#ffffff" opacity="0.9" />
              <rect x="98" y="50" width="4" height="106" rx="2" fill="url(#goldGrad)" />
              {/* Dollar S Ribbon */}
              <path
                d="M86 76 C86 64 114 62 114 74 C114 88 84 90 84 108 C84 124 116 122 116 110"
                fill="none"
                stroke="url(#goldGrad)"
                strokeWidth="7"
                strokeLinecap="round"
              />
            </g>

            {/* Top Star */}
            <circle cx="100" cy="36" r="3" fill="#ffffff" />
            <polygon points="100,28 102,36 110,36 103,40 106,48 100,43 94,48 97,40 90,36 98,36" fill="#fff9d6" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="title">CASHFLOW</h1>

        {/* Subtitle */}
        <div className="subtitle">TAP INTO YOUR WEALTH</div>

        {/* Tagline */}
        <div className="tagline">THE WEALTH SIMULATOR</div>

        {/* Glowing "TAP TO BEGIN" Button */}
        <div className="btn-outer-ring" onClick={startGame}>
          <div className="tap-btn">
            <span>TAP TO BEGIN</span>
            <span className="chevron">&gt;</span>
          </div>
        </div>

        {/* Footer Prompt */}
        <div className="footer-prompt">Please tap the screen to start your journey.</div>
      </div>
    </div>
  );
}
