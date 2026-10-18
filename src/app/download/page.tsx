"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Download,
  Monitor,
  Smartphone,
  Apple,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Zap,
  ExternalLink,
  Laptop,
} from "lucide-react";
import { triggerConfetti } from "@/lib/confetti";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function DownloadAppPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installedNotice, setInstalledNotice] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone);

      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      };

      window.addEventListener("beforeinstallprompt", handler);
      window.addEventListener("appinstalled", () => {
        setIsInstalled(true);
        setInstalledNotice(true);
        triggerConfetti();
      });

      return () => {
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }
  }, []);

  const handlePwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstalledNotice(true);
        triggerConfetti();
      }
      setDeferredPrompt(null);
    } else {
      alert("AuraWealth can be installed directly from your browser menu:\n\n• On Chrome/Edge: Click the 'Install App' icon on the right side of the address bar, or menu (⋮) -> 'Install AuraWealth'.\n• On Mobile: Tap Share / Menu -> 'Add to Home Screen'.");
    }
  };

  return (
    <div className="min-h-screen bg-[#070a07] text-slate-100 relative overflow-x-hidden selection:bg-emerald-500 selection:text-black">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-panel text-slate-300 hover:text-white transition-all text-sm font-semibold hover:border-emerald-500/50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono font-bold text-emerald-400">PWA & Desktop v3.4</span>
          </div>
        </div>

        {/* Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-bold shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Standalone Native App Experience</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-display">
            Download & Install <br />
            <span className="bg-gradient-to-r from-amber-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              AuraWealth 3D App
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Enjoy full-screen zero-lag financial tracking, instant hardware-accelerated 3D graphics, and standalone desktop/mobile launcher without browser URL bars.
          </p>
        </div>

        {/* Notification when app is already installed */}
        {isInstalled && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/50 flex items-center justify-center gap-3 text-emerald-300 text-sm font-bold shadow-xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>AuraWealth is already installed as a standalone application on this system!</span>
          </div>
        )}

        {/* ================= PRIMARY APP DOWNLOAD TILES ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: 1-Click Browser PWA Install */}
          <div className="p-7 rounded-3xl glass-panel border border-emerald-500/30 flex flex-col justify-between space-y-6 hover:border-emerald-500/60 transition-all shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 p-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg">
                  <Laptop className="w-7 h-7 text-slate-950" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Universal
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-white font-display">
                  One-Click Install
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Installs immediately in standalone window mode on <strong>Windows</strong>, <strong>Mac</strong>, or <strong>ChromeOS</strong> with desktop badge.
                </p>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>0 download required • Instant setup</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Desktop & Taskbar standalone icon</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePwaInstall}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:opacity-95 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-98 transition-all"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{deferredPrompt ? "Install On Device" : "Install Browser App"}</span>
            </button>
          </div>

          {/* Card 2: Android APK Download (.apk) */}
          <div className="p-7 rounded-3xl glass-panel border border-teal-500/30 flex flex-col justify-between space-y-6 hover:border-teal-500/60 transition-all shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 p-3 rounded-2xl bg-gradient-to-tr from-teal-400 to-emerald-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg">
                  <Smartphone className="w-7 h-7 text-slate-950" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Android APK
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-white font-display">
                  Android App (.apk)
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Download the standalone Android <strong>.apk</strong> package to install directly on your Android phone or tablet.
                </p>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Native APK with Hardware WebGL</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Install on any Android 8.0+ device</span>
                </div>
              </div>
            </div>

            <a
              href="https://github.com/abhi0x18/aurawealth-expense-tracker/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400 hover:opacity-95 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-teal-500/25 active:scale-98 transition-all"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Download Android APK</span>
            </a>
          </div>

          {/* Card 3: Windows Desktop Standalone Installer (.BAT) */}
          <div className="p-7 rounded-3xl glass-panel border border-amber-500/30 flex flex-col justify-between space-y-6 hover:border-amber-500/60 transition-all shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 p-3 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg">
                  <Monitor className="w-7 h-7 text-slate-950" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Windows (.bat)
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-white font-display">
                  Windows Desktop
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Automated Windows Desktop shortcut script that launches in dedicated 1366x860 app-window mode.
                </p>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Desktop icon: AuraWealth 3D</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Opens without browser URL or tab bar</span>
                </div>
              </div>
            </div>

            <a
              href="/downloads/AuraWealth-Desktop-Installer.bat"
              download="AuraWealth-Desktop-Installer.bat"
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 hover:opacity-95 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 active:scale-98 transition-all"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Download Windows (.bat)</span>
            </a>
          </div>

        </div>

        {/* ================= MOBILE PLATFORM QUICK GUIDE ================= */}
        <div className="p-8 rounded-3xl glass-panel border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <Smartphone className="w-6 h-6 text-emerald-400" />
            <h3 className="text-xl font-bold text-white">How to Install on Mobile Devices</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
            <div className="p-5 rounded-2xl bg-black/40 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">1</span>
                <span>Android (Chrome / Brave / Edge)</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Open this website in Chrome on your Android phone. Tap the <strong>three dots (⋮)</strong> at the top right, then tap <strong>&quot;Install App&quot;</strong> or <strong>&quot;Add to Home Screen&quot;</strong>. AuraWealth will install as a native icon.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-black/40 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Apple className="w-4 h-4" />
                <span>iPhone & iPad (Safari)</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Open this website in Safari on your iPhone. Tap the <strong>Share button (square with arrow up ⎙)</strong>, scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>. AuraWealth launches full-screen without Safari UI.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 text-center space-y-2">
            <Zap className="w-6 h-6 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-white text-sm">Hardware Acceleration</h4>
            <p className="text-xs text-slate-400">Smooth 60fps WebGL 3D card tilt and zero-lag financial charts.</p>
          </div>
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 text-center space-y-2">
            <ShieldCheck className="w-6 h-6 text-amber-400 mx-auto" />
            <h4 className="font-bold text-white text-sm">Offline Caching</h4>
            <p className="text-xs text-slate-400">Service Worker keeps application shell ready even without internet.</p>
          </div>
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 text-center space-y-2">
            <Monitor className="w-6 h-6 text-teal-400 mx-auto" />
            <h4 className="font-bold text-white text-sm">Zero Browser Clutter</h4>
            <p className="text-xs text-slate-400">Runs as an independent desktop window with clean taskbar badge.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
