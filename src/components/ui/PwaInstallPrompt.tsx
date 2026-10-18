"use client";

import React, { useState, useEffect } from "react";
import { Download, Monitor, CheckCircle, Smartphone, Sparkles, X } from "lucide-react";
import Link from "next/link";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallPrompt({ variant = "floating" }: { variant?: "floating" | "button" | "banner" }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // Check if already running as installed standalone app
    if (typeof window !== "undefined") {
      const isApp = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
      setIsStandalone(isApp);

      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      };

      window.addEventListener("beforeinstallprompt", handler);
      window.addEventListener("appinstalled", () => {
        setInstalledSuccess(true);
        setDeferredPrompt(null);
      });

      return () => {
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setInstalledSuccess(true);
      }
      setDeferredPrompt(null);
    } else {
      // Direct user to dedicated download center
      window.location.href = "/download";
    }
  };

  // Do not show banner if already running inside installed standalone app
  if (isStandalone) return null;

  if (variant === "button") {
    return (
      <button
        onClick={handleInstallClick}
        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
        title="Install AuraWealth App on this device"
      >
        <Download className="w-4 h-4" />
        <span>Install App</span>
      </button>
    );
  }

  if (variant === "banner" || variant === "floating") {
    if (isDismissed || installedSuccess) return null;

    return (
      <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full p-4 rounded-2xl glass-panel border border-emerald-500/40 shadow-2xl backdrop-blur-xl animate-fade-in flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
              $
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Install AuraWealth App</h4>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Zero-lag standalone window & offline 3D cockpit
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleInstallClick}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{deferredPrompt ? "Install Now" : "Download App"}</span>
          </button>
          <Link
            href="/download"
            className="py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-all text-center"
          >
            Options
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
