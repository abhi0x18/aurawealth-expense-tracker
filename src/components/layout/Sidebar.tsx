"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Landmark,
  PieChart,
  Repeat,
  PiggyBank,
  BarChart3,
  Tags,
  Settings,
  X,
  Layers,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/accounts", label: "Accounts & Cards", icon: Landmark },
  { href: "/budgets", label: "Budgets", icon: PieChart },
  { href: "/recurring", label: "Recurring & Bills", icon: Repeat },
  { href: "/goals", label: "Savings Goals", icon: PiggyBank },
  { href: "/reports", label: "Reports & Analytics", icon: BarChart3 },
  { href: "/categories", label: "Categories & Tags", icon: Tags },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Glassmorphic Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white/90 dark:bg-slate-950/85 backdrop-blur-2xl border-r border-slate-200/80 dark:border-white/10 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Ambient Top Glow in Sidebar */}
        <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-emerald-500/15 via-teal-500/5 to-transparent pointer-events-none" />

        {/* Brand Header */}
        <div className="h-18 flex items-center justify-between px-6 border-b border-slate-200/70 dark:border-white/10 relative z-10">
          <Link href="/" className="flex items-center gap-3 group focus:outline-none" onClick={onClose}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-indigo-600 p-0.5 shadow-lg shadow-emerald-500/25 group-hover:rotate-12 transition-transform duration-300">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Layers className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  AuraWealth
                </span>
                <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  3D
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5">
                FinFlow Spatial OS
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links with larger text for high readability */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto relative z-10">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`relative flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all group ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-indigo-500/10 text-emerald-700 dark:text-emerald-300 shadow-md border border-emerald-500/30"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                }`}
              >
                {/* Active Left Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-2.5 bottom-2.5 w-1.5 bg-gradient-to-b from-emerald-400 to-indigo-500 rounded-r-full shadow-sm shadow-emerald-500/50" />
                )}

                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 scale-105"
                      : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Private Local Vault Badge */}
        <div className="p-4 border-t border-slate-200/70 dark:border-white/10 relative z-10">
          <div className="p-3.5 bg-slate-100/90 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-white/10 backdrop-blur-md shadow-inner">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse" />
                <span>Encrypted Vault</span>
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-medium">
              Local-first SQLite. 0 cloud trackers.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
