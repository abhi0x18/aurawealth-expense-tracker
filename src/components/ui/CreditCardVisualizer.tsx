"use client";

import React, { useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { Wifi, ArrowUpRight, Sparkles } from "lucide-react";

interface CreditCardVisualizerProps {
  id?: string;
  name: string;
  type: string;
  balancePaise: bigint | number;
  accountNumber?: string;
  theme?: "emerald" | "obsidian" | "sapphire" | "amethyst" | "rose";
  onTransferClick?: () => void;
  onAddTransactionClick?: () => void;
}

export function CreditCardVisualizer({
  name,
  type,
  balancePaise,
  accountNumber = "8492",
  theme = "emerald",
  onTransferClick,
  onAddTransactionClick,
}: CreditCardVisualizerProps) {
  const { formatMoney } = useCurrency();
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Tilt physics +- 12 deg
    setRotateX(((y - centerY) / centerY) * -11);
    setRotateY(((x - centerX) / centerX) * 13);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const themeStyles = {
    emerald: "from-emerald-900 via-teal-950 to-slate-950 border-emerald-500/30 text-emerald-100 shadow-emerald-950/50",
    obsidian: "from-slate-900 via-zinc-900 to-black border-slate-700/40 text-slate-100 shadow-black/60",
    sapphire: "from-blue-900 via-indigo-950 to-slate-950 border-blue-500/30 text-blue-100 shadow-blue-950/50",
    amethyst: "from-purple-900 via-fuchsia-950 to-slate-950 border-purple-500/30 text-purple-100 shadow-purple-950/50",
    rose: "from-rose-900 via-pink-950 to-slate-950 border-rose-500/30 text-rose-100 shadow-rose-950/50",
  }[theme];

  return (
    <div
      className="perspective-container w-full max-w-sm mx-auto select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`relative h-60 rounded-3xl p-6 bg-gradient-to-tr ${themeStyles} border shadow-2xl transition-transform duration-200 ease-out flex flex-col justify-between overflow-hidden animate-shimmer`}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Specular 3D Reflection overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent pointer-events-none rounded-3xl" />
        
        {/* Ambient Glow Orb */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        
        {/* Card Header: Type, Contactless icon & Metallic Chip */}
        <div className="flex items-center justify-between relative z-10" style={{ transform: "translateZ(25px)" }}>
          <div className="flex items-center gap-3">
            {/* Realistic EMV Metallic Chip */}
            <div className="w-12 h-9 rounded-md bg-gradient-to-tr from-amber-200 via-yellow-400 to-amber-500 p-0.5 shadow-md border border-amber-300/60 relative overflow-hidden">
              <div className="w-full h-full border border-amber-600/40 rounded flex flex-col justify-between p-0.5">
                <div className="h-[1px] bg-amber-700/40 w-full" />
                <div className="h-[1px] bg-amber-700/40 w-full" />
              </div>
            </div>
            
            {/* Contactless Waves */}
            <Wifi className="w-5 h-5 text-white/80 rotate-90" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-black uppercase tracking-wider px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-white shadow-sm">
              {type}
            </span>
          </div>
        </div>

        {/* Card Middle: Available Balance */}
        <div className="my-auto relative z-10" style={{ transform: "translateZ(35px)" }}>
          <p className="text-sm font-bold text-white/90 uppercase tracking-wider mb-1">
            Current Balance
          </p>
          <h3 className="text-3xl sm:text-4xl font-mono font-black tracking-tight text-white drop-shadow-xl">
            <AnimatedCounter valuePaise={balancePaise} />
          </h3>
        </div>

        {/* Card Footer: Account Number & Cardholder / Bank */}
        <div className="flex items-end justify-between relative z-10" style={{ transform: "translateZ(20px)" }}>
          <div>
            <p className="text-base font-mono font-black tracking-widest text-white/95">
              •••• •••• •••• {accountNumber.slice(-4)}
            </p>
            <p className="text-base font-display font-black text-white uppercase tracking-wider mt-1 truncate max-w-[200px]">
              {name}
            </p>
          </div>

          {/* Holographic Card Network Logo */}
          <div className="flex items-center">
            <div className="flex -space-x-3 opacity-90">
              <div className="w-7 h-7 rounded-full bg-rose-500 shadow-md" />
              <div className="w-7 h-7 rounded-full bg-amber-400 shadow-md opacity-85" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Pills underneath */}
      {(onTransferClick || onAddTransactionClick) && (
        <div className="flex items-center justify-center gap-3 mt-4">
          {onTransferClick && (
            <button
              type="button"
              onClick={onTransferClick}
              className="text-sm font-bold px-4 py-2 rounded-full bg-slate-800/90 hover:bg-emerald-600 text-slate-100 hover:text-white border border-slate-700/70 transition-all flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              Transfer
            </button>
          )}
          {onAddTransactionClick && (
            <button
              type="button"
              onClick={onAddTransactionClick}
              className="text-sm font-bold px-4 py-2 rounded-full bg-slate-800/90 hover:bg-emerald-600 text-slate-100 hover:text-white border border-slate-700/70 transition-all flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300 stroke-[2.5]" />
              Record
            </button>
          )}
        </div>
      )}
    </div>
  );
}
