"use client";

import React from "react";

/**
 * 3D Isometric Safe Vault Illustration (Vector SVG with gradient mesh)
 */
export function Vault3DProp({ className = "w-28 h-28" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="vaultGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="vaultFront" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="vaultDoor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="emeraldNeon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Ambient Radial Backlight */}
      <circle cx="100" cy="100" r="90" fill="url(#vaultGlow)" />

      {/* 3D Vault Outer Frame */}
      <rect x="40" y="45" width="120" height="110" rx="18" fill="url(#vaultFront)" stroke="#475569" strokeWidth="3" />
      <rect x="45" y="50" width="110" height="100" rx="14" fill="#090d16" stroke="#334155" strokeWidth="1" />

      {/* Vault Circular Dial */}
      <circle cx="100" cy="100" r="32" fill="url(#vaultDoor)" stroke="#64748b" strokeWidth="2.5" />
      <circle cx="100" cy="100" r="22" fill="#0f172a" stroke="url(#emeraldNeon)" strokeWidth="2" strokeDasharray="4 3" />
      <circle cx="100" cy="100" r="10" fill="url(#emeraldNeon)" />

      {/* 3D Dial Spokes */}
      <rect x="98" y="70" width="4" height="60" rx="2" fill="#94a3b8" />
      <rect x="70" y="98" width="60" height="4" rx="2" fill="#94a3b8" />

      {/* Isometric Gold Coins Stack */}
      <g transform="translate(130, 115)">
        <ellipse cx="15" cy="20" rx="16" ry="6" fill="#78350f" />
        <ellipse cx="15" cy="15" rx="16" ry="6" fill="url(#goldGradient)" stroke="#fde68a" strokeWidth="0.8" />
        <ellipse cx="15" cy="9" rx="16" ry="6" fill="url(#goldGradient)" stroke="#fde68a" strokeWidth="0.8" />
        <ellipse cx="15" cy="3" rx="16" ry="6" fill="url(#goldGradient)" stroke="#fde68a" strokeWidth="0.8" />
        <text x="15" y="5" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#78350f">₹</text>
      </g>
    </svg>
  );
}

/**
 * 3D Isometric Target & Growth Arrow (For Savings Goals & Budgets)
 */
export function Target3DProp({ className = "w-28 h-28" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="targetGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="arrowGrad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>

      <circle cx="100" cy="100" r="85" fill="url(#targetGlow)" />

      {/* Target Concentric Rings in 3D Perspective */}
      <ellipse cx="100" cy="110" rx="65" ry="35" fill="#1e293b" stroke="#3b82f6" strokeWidth="3" />
      <ellipse cx="100" cy="110" rx="45" ry="24" fill="#0f172a" stroke="#60a5fa" strokeWidth="2.5" />
      <ellipse cx="100" cy="110" rx="25" ry="14" fill="#1e293b" stroke="#10b981" strokeWidth="3" />
      <ellipse cx="100" cy="110" rx="10" ry="6" fill="#10b981" />

      {/* Upward 3D Growth Arrow Piercing Center */}
      <path
        d="M60 145 L95 108 L105 108 L140 60 L145 75 L150 45 L120 50 L132 55 L98 98 L88 98 Z"
        fill="url(#arrowGrad)"
        filter="drop-shadow(0px 8px 12px rgba(16, 185, 129, 0.4))"
      />
    </svg>
  );
}

/**
 * 3D Analytics & Growth Graph Prop (For Reports & Cash Flow)
 */
export function Analytics3DProp({ className = "w-28 h-28" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="chartGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bar1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="bar2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="bar3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
      </defs>

      <circle cx="100" cy="100" r="85" fill="url(#chartGlow)" />

      {/* 3D Glass Platform Grid */}
      <polygon points="30,130 100,165 170,130 100,95" fill="rgba(30, 41, 59, 0.7)" stroke="#475569" strokeWidth="1.5" />

      {/* 3D Chart Bars */}
      {/* Bar 1 */}
      <g transform="translate(60, 85)">
        <polygon points="0,35 15,42 15,10 0,3" fill="#059669" />
        <polygon points="15,42 30,35 30,3 15,10" fill="#047857" />
        <polygon points="0,3 15,10 30,3 15,-4" fill="url(#bar1)" />
      </g>

      {/* Bar 2 */}
      <g transform="translate(90, 60)">
        <polygon points="0,60 15,67 15,10 0,3" fill="#2563eb" />
        <polygon points="15,67 30,60 30,3 15,10" fill="#1d4ed8" />
        <polygon points="0,3 15,10 30,3 15,-4" fill="url(#bar2)" />
      </g>

      {/* Bar 3 */}
      <g transform="translate(120, 40)">
        <polygon points="0,80 15,87 15,10 0,3" fill="#7c3aed" />
        <polygon points="15,87 30,80 30,3 15,10" fill="#6d28d9" />
        <polygon points="0,3 15,10 30,3 15,-4" fill="url(#bar3)" />
      </g>
    </svg>
  );
}
